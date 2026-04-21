import { createClient } from './supabase';

export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}