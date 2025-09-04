import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

// POST /api/polls/[id]/vote - record a vote
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pollId } = params;
    const supabase = getSupabaseClient();
    
    // Get the current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Ensure user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // Create profile if it doesn't exist
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        });

      if (insertProfileError) {
        console.error('Profile creation error:', insertProfileError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 }
        );
      }
    }

    // Use the helper function to record the vote
    const { data: voteResult, error: voteError } = await supabase
      .rpc('record_vote', {
        poll_uuid: pollId,
        option_uuid: optionId,
        voter_uuid: user.id
      });

    if (voteError) {
      console.error('Vote recording error:', voteError);
      
      // Handle specific error cases
      if (voteError.message?.includes('Poll not found')) {
        return NextResponse.json(
          { error: "Poll not found" },
          { status: 404 }
        );
      }
      
      if (voteError.message?.includes('Poll is not active')) {
        return NextResponse.json(
          { error: "Poll is not active" },
          { status: 400 }
        );
      }
      
      if (voteError.message?.includes('Poll is not public')) {
        return NextResponse.json(
          { error: "Poll is not public" },
          { status: 403 }
        );
      }
      
      if (voteError.message?.includes('Invalid option')) {
        return NextResponse.json(
          { error: "Invalid option for this poll" },
          { status: 400 }
        );
      }
      
      if (voteError.message?.includes('already voted')) {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    // Get the updated poll with new vote counts
    const { data: updatedPoll, error: fetchError } = await supabase
      .rpc('get_poll_with_options', { poll_uuid: pollId });

    if (fetchError) {
      console.error('Poll fetch error:', fetchError);
      return NextResponse.json(
        { message: "Vote recorded successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: "Vote recorded successfully",
      poll: updatedPoll[0]
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/polls/[id]/vote - get user's vote on this poll
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pollId } = params;
    const supabase = getSupabaseClient();
    
    // Get the current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's vote on this poll
    const { data: vote, error } = await supabase
      .from('votes')
      .select('option_id, created_at')
      .eq('poll_id', pollId)
      .eq('voter_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Vote fetch error:', error);
      return NextResponse.json(
        { error: "Failed to fetch vote" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasVoted: !!vote,
      vote: vote || null
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
