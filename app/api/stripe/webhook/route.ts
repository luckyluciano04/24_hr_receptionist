import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import {
  sendConfirmationEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
} from '@/lib/resend';
import { logger } from '@/lib/logger';
import type Stripe from 'stripe';
import type { Tier } from '@/lib/constants';

export const maxDuration = 30;

/**
 * Returns a raw Supabase client with service role privileges that exposes
 * the auth.admin API (createUser, generateLink, etc.). We use the raw
 * @supabase/supabase-js client here because @supabase/ssr's createServerClient
 * wraps it for cookie-based sessions and its auth.admin surface may differ.
 */
function getSupabaseAuthAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for auth admin');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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
  const authAdmin = getSupabaseAuthAdmin();

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

        // Find or create a Supabase auth user so the profile row can reference auth.users
        let authUserId: string;
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (existingProfile?.id) {
          authUserId = existingProfile.id;
        } else {
          const { data: newUser, error: createError } = await authAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
          });
          if (createError || !newUser.user) {
            logger.error('stripe.webhook.auth_user_creation_failed', {
              email,
              error: createError?.message,
            });
            break;
          }
          authUserId = newUser.user.id;
        }

        await supabase.from('profiles').upsert(
          {
            id: authUserId,
            email,
            business_name: businessName,
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          },
          { onConflict: 'stripe_customer_id' },
        );

        // Generate a magic link so the user can sign in and reach onboarding
        let loginUrl: string | undefined;
        try {
          const { data: linkData } = await authAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
            },
          });
          loginUrl = linkData?.properties?.action_link ?? undefined;
        } catch (linkErr) {
          logger.warn('stripe.webhook.magic_link_failed', { email, error: String(linkErr) });
        }

        await sendConfirmationEmail(email, businessName || email, tier, loginUrl);
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
