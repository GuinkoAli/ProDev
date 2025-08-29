import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

// GET /api/polls/public - list public active polls
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const supabase = getSupabaseClient();

    // Get public active polls with basic info
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        description,
        created_at,
        expires_at,
        allow_multiple_votes,
        (
          SELECT COUNT(*)::bigint
          FROM votes
          WHERE poll_id = polls.id
        ) as total_votes
      `)
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch public polls" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      polls: polls || [],
      pagination: {
        limit,
        offset,
        hasMore: (polls?.length || 0) === limit
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
