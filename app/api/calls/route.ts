import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

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
      .select('id, from_number, to_number, status, duration, created_at, recording_url, call_transcript, call_summary')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`from_number.ilike.%${search}%,to_number.ilike.%${search}%`);
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
    console.error('Get calls error:', error);
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
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete call error:', error);
    return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 });
  }
}
