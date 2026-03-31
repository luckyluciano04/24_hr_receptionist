import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    let query = supabase
      .from('calls')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`caller_name.ilike.%${search}%,caller_phone.ilike.%${search}%,call_summary.ilike.%${search}%`);
    }
    if (from) {
      query = query.gte('created_at', from);
    }
    if (to) {
      query = query.lte('created_at', to);
    }

    const { data: calls, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ calls });
  } catch (error) {
    logger.error('calls.get_error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing call ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('calls.delete_error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 });
  }
}
