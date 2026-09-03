import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClientSupabase();

    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', id)
      .order('created_at', { ascending: true });

    if (optionsError) throw optionsError;

    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', id);

    if (votesError) throw votesError;

    const voteCounts = new Map<string, number>();
    const optionIds: string[] = [];
    for (const opt of options ?? []) {
      voteCounts.set(opt.id, 0);
      optionIds.push(opt.id);
    }
    for (const vote of votes ?? []) {
      const current = voteCounts.get(vote.option_id) ?? 0;
      voteCounts.set(vote.option_id, current + 1);
    }

    const results = (options ?? []).map((opt) => ({
      ...opt,
      votes: voteCounts.get(opt.id) ?? 0,
    }));

    const totalVotes = (votes ?? []).length;

    return NextResponse.json({ options: results, totalVotes });
  } catch (error) {
    console.error('[Poll Vote GET Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to fetch poll results' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClientSupabase();
    const body = await request.json();

    const { data: existingVote, error: existingError } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      console.error('[Poll Vote POST Error]', {
        message: existingError.message,
        code: existingError.code,
        details: existingError.details,
        hint: existingError.hint,
      });
      throw existingError;
    }

    if (existingVote) {
      const { data, error } = await supabase
        .from('poll_votes')
        .update({ option_id: body.option_id })
        .eq('id', existingVote.id)
        .select()
        .single();

      if (error) {
        console.error('[Poll Vote Update Error]', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: id,
        option_id: body.option_id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Poll Vote Insert Error]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Poll Vote Exception]', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
