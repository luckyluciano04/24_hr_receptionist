import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // no-op
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Dashboard</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Welcome back.
        </h1>
        <p className="mt-4 text-lg text-white/65">
          {user.email}
        </p>

        <div className="mt-10 rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
          <p className="text-lg font-semibold">Your AI receptionist is live.</p>
          <p className="mt-2 text-white/65">
            Next step: connect your call flow, routing rules, and notifications.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white"
            >
              Upgrade plan
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-medium text-white/85"
            >
              View homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
