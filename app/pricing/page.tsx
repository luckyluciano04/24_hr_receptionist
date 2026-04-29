export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl">$97/month</h1>

      <a
        href="https://buy.stripe.com/YOUR_LINK"
        className="mt-6 bg-blue-600 px-6 py-3 rounded"
      >
        Start now
      </a>
    </div>
  );
}
