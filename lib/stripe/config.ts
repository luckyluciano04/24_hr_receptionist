import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function getActivePrices() {
  return await stripe.prices.list({
    active: true,
    expand: ["data.product"],
  });
}
