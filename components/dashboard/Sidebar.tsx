'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/calls', label: 'Call Log', icon: '📞' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#0D0D0D]">
      <div className="border-b border-white/10 p-6">
        <Link href="/" className="text-lg font-bold text-white">
          24hr Receptionist
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
