import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user?.email) {
    return NextResponse.redirect(new URL("/signup", process.env.NEXT_PUBLIC_SITE_URL!), 302);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer_email: user.email,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });

  return NextResponse.redirect(session.url, 302);
}
