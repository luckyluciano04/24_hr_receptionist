import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { LeadCapture } from '@/components/dashboard/LeadCapture';

interface Lead {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
}

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            <p className="mt-1 text-gray-400">Capture and manage incoming call leads.</p>
          </div>
          <LeadCapture initialLeads={(leads as Lead[]) ?? []} />
        </div>
      </main>
    </div>
  );
}
