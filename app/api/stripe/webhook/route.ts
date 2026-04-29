import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid webhook';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email;

    if (email) {
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('email', email);
    }
  }

  return Response.json({ received: true });
}
