import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { sendCancellationEmail, sendConfirmationEmail, sendPaymentFailedEmail } from '@/lib/resend';
import { logger } from '@/lib/logger';
import { getBillingEnv } from '@/lib/billing/env';
import {
  isBillingInterval,
  isPlan,
  resolvePlanFromPriceId,
  type BillingInterval,
  type Plan,
} from '@/lib/billing/config';

interface BillingSyncPayload {
  customerId: string;
  subscriptionId: string;
  plan: Plan;
  interval: BillingInterval;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  cancellationReason: string | null;
}

function toIsoTimestamp(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds) {
    return null;
  }
  return new Date(unixSeconds * 1000).toISOString();
}

function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const subscriptionLevelPeriodEnd = (
    subscription as Stripe.Subscription & { current_period_end?: number | null }
  ).current_period_end;
  return subscriptionLevelPeriodEnd ?? subscription.items.data[0]?.current_period_end ?? null;
}

async function resolvePlanAndIntervalFromSubscription(
  subscription: Stripe.Subscription,
): Promise<{ plan: Plan; interval: BillingInterval }> {
  const metadataPlan = subscription.metadata?.plan;
  const metadataInterval = subscription.metadata?.interval;
  if (
    metadataPlan &&
    metadataInterval &&
    isPlan(metadataPlan) &&
    isBillingInterval(metadataInterval)
  ) {
    return { plan: metadataPlan, interval: metadataInterval };
  }

  const priceId = subscription.items.data[0]?.price?.id;
  if (!priceId) {
    throw new Error(`[stripe.webhook] Unable to resolve plan for subscription ${subscription.id}`);
  }

  return resolvePlanFromPriceId(priceId);
}

async function syncBillingByCustomer(
  supabase: ReturnType<typeof createAdminClient>,
  payload: BillingSyncPayload,
) {
  await supabase
    .from('profiles')
    .update({
      tier: payload.plan,
      billing_interval: payload.interval,
      subscription_status: payload.status,
      current_period_end: payload.currentPeriodEnd,
      stripe_customer_id: payload.customerId,
      stripe_subscription_id: payload.subscriptionId,
      cancel_at_period_end: payload.cancelAtPeriodEnd,
      canceled_at: payload.canceledAt,
      cancellation_reason: payload.cancellationReason,
    })
    .eq('stripe_customer_id', payload.customerId);
}

async function syncFromSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;
  if (!customerId) {
    throw new Error(`[stripe.webhook] Missing customer ID on subscription ${subscription.id}`);
  }

  const { plan, interval } = await resolvePlanAndIntervalFromSubscription(subscription);
  await syncBillingByCustomer(supabase, {
    customerId,
    subscriptionId: subscription.id,
    plan,
    interval,
    status: subscription.status,
    currentPeriodEnd: toIsoTimestamp(getSubscriptionCurrentPeriodEnd(subscription)),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: toIsoTimestamp(subscription.canceled_at),
    cancellationReason:
      subscription.cancellation_details?.comment ?? subscription.metadata?.cancellation_reason ?? null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const { STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_SITE_URL } = getBillingEnv();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('stripe.webhook.signature_failed', { error: String(err) });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const supabase = createAdminClient();
  logger.info('stripe.webhook.received', { eventType: event.type, eventId: event.id });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.metadata?.email;
        const businessName = session.metadata?.businessName ?? '';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!email || !customerId || !subscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { plan, interval } = await resolvePlanAndIntervalFromSubscription(subscription);

        let userId: string;
        try {
          const normalizedEmail = email.trim().toLowerCase();
          const { data: usersPage, error: listUsersError } = await supabase.auth.admin.listUsers();
          if (listUsersError) {
            throw new Error(`Failed to list auth users: ${listUsersError.message}`);
          }

          const existingUser = usersPage.users.find(
            (user) => user.email?.trim().toLowerCase() === normalizedEmail,
          );

          if (existingUser) {
            userId = existingUser.id;
          } else {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { business_name: businessName },
            });
            if (createError || !newUser.user) {
              throw new Error(
                `Failed to create auth user: ${createError?.message ?? 'unknown'}`,
              );
            }
            userId = newUser.user.id;
          }
        } catch (authErr) {
          logger.error('stripe.checkout.auth_user_error', { email, error: String(authErr) });
          break;
        }

        await supabase.from('profiles').upsert(
          {
            id: userId,
            email,
            business_name: businessName,
            tier: plan,
            billing_interval: interval,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: subscription.status,
            current_period_end: toIsoTimestamp(getSubscriptionCurrentPeriodEnd(subscription)),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: toIsoTimestamp(subscription.canceled_at),
            cancellation_reason:
              subscription.cancellation_details?.comment ??
              subscription.metadata?.cancellation_reason ??
              null,
          },
          { onConflict: 'email' },
        );

        let magicLink: string | undefined;
        try {
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo: `${NEXT_PUBLIC_SITE_URL}/onboarding` },
          });
          magicLink = linkData?.properties?.action_link ?? undefined;
        } catch (linkErr) {
          logger.warn('stripe.checkout.magic_link_error', { email, error: String(linkErr) });
        }

        await sendConfirmationEmail(email, businessName || email, plan, magicLink);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncFromSubscription(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncFromSubscription(supabase, subscription);

        const customerId = subscription.customer as string;
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, business_name')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile?.email) {
          await sendCancellationEmail(profile.email, profile.business_name ?? profile.email);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceWithSubscription = invoice as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const directSubscriptionRef = invoiceWithSubscription.subscription;
        const subscriptionRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId =
          typeof directSubscriptionRef === 'string'
            ? directSubscriptionRef
            : directSubscriptionRef?.id ??
              (typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id);
        if (!subscriptionId) {
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncFromSubscription(supabase, subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId);

          const { data: profile } = await supabase
            .from('profiles')
            .select('email, business_name')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile?.email) {
            await sendPaymentFailedEmail(profile.email, profile.business_name ?? profile.email);
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    logger.error('stripe.webhook.handler_error', { eventType: event.type, error: String(err) });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
