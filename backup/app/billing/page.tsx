/* eslint-disable @typescript-eslint/no-explicit-any */
import { getActivePrices } from "@/lib/stripe/config";

export default async function BillingPage() {
  const prices = await getActivePrices();

  return (
    <div style={{padding: 40}}>
      <h1>Pricing</h1>
      <div style={{display: "flex", gap: 20}}>
        {prices.data.map((price) => (
          <div key={price.id} style={{border: "1px solid #ccc", padding: 20}}>
            <h2>{(price.product as any).name}</h2>
            <p>${price.unit_amount! / 100} / {price.recurring?.interval}</p>
            <form action="/api/checkout" method="POST">
              <input type="hidden" name="priceId" value={price.id} />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
