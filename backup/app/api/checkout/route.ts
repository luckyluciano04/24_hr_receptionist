import { stripe } from "@/lib/stripe/config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const priceId = formData.get("priceId");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId as string, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
  });

  return NextResponse.redirect(session.url!, 303);
}
