import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const email = session.customer_email;

    await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('email', email);
  }

  return Response.json({ received: true });
}
