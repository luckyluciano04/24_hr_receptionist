import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plan = (searchParams.get("plan") || "starter").toLowerCase();

  const priceMap: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER ?? "",
    professional: process.env.STRIPE_PRICE_PROFESSIONAL ?? "",
    pro: process.env.STRIPE_PRICE_PROFESSIONAL ?? "",
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
  };

  const priceId = priceMap[plan];

  if (!priceId) {
    return new NextResponse("Invalid plan", { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  if (!session.url) {
    return new NextResponse("Stripe session missing redirect URL", { status: 500 });
  }

  return NextResponse.redirect(session.url);
}
