import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '../../../lib/supabase/server';
import {
  sendConfirmationEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
} from '@/lib/resend';
import { logger } from '@/lib/logger';
import { APP_URL } from '@/lib/constants';
import type Stripe from 'stripe';
import type { Tier } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('stripe.webhook', { msg: 'STRIPE_WEBHOOK_SECRET is not configured' });
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
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
        const email = session.customer_details?.email ?? (session.metadata?.email as string);
        const businessName = (session.metadata?.businessName as string) ?? '';
        const tier = ((session.metadata?.tier as string) ?? 'starter') as Tier;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        logger.info('stripe.checkout.completed', {
          sessionId: session.id,
          customerId,
          tier,
          amount: session.amount_total,
        });

        if (!email) break;

        // Ensure a Supabase auth user exists so the customer can log in
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
            const { data: newUser, error: createError } =
              await supabase.auth.admin.createUser({
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
          logger.error('stripe.checkout.auth_user_error', {
            email,
            error: String(authErr),
          });
          break;
        }

        await supabase.from('profiles').upsert(
          {
            id: userId, // Required for INSERT: explicitly set the primary key for new profiles
            email,
            business_name: businessName,
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          },
          { onConflict: 'stripe_customer_id' },
        );

        // Generate a one-time magic link so the user can access onboarding immediately
        let magicLink: string | undefined;
        try {
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: { redirectTo: `${APP_URL}/onboarding` },
          });
          magicLink = linkData?.properties?.action_link ?? undefined;
        } catch (linkErr) {
          logger.warn('stripe.checkout.magic_link_error', {
            email,
            error: String(linkErr),
          });
        }

        await sendConfirmationEmail(email, businessName || email, tier, magicLink);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const tier = (sub.metadata?.tier ?? 'starter') as Tier;
        const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'inactive';

        logger.info('stripe.subscription.updated', {
          subscriptionId: sub.id,
          customerId,
          tier,
          status,
        });

        await supabase
          .from('profiles')
          .update({ tier, subscription_status: status, stripe_subscription_id: sub.id })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        logger.info('stripe.subscription.deleted', { subscriptionId: sub.id, customerId });

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, business_name')
          .eq('stripe_customer_id', customerId)
          .single();

        await supabase
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('stripe_customer_id', customerId);

        if (profile?.email) {
          await sendCancellationEmail(profile.email, profile.business_name ?? profile.email);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        logger.warn('stripe.invoice.payment_failed', {
          invoiceId: invoice.id,
          customerId,
          amount: invoice.amount_due,
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, business_name')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile?.email) {
          await sendPaymentFailedEmail(profile.email, profile.business_name ?? profile.email);
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
