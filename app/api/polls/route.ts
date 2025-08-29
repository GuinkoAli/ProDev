import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { cookies } from "next/headers";

// GET /api/polls - list current user's polls
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = getSupabaseClient();
    
    // Get the current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's polls using the helper function
    const { data: polls, error } = await supabase
      .rpc('get_user_polls', { user_uuid: user.id });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch polls" },
        { status: 500 }
      );
    }

    return NextResponse.json({ polls: polls || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/polls - create a poll
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
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
    const { question, description, options, allowMultipleVotes = false, expiresAt, isPublic = true } = body;

    // Validate required fields
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "Question and at least 2 options are required" },
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

    // Insert the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        creator_id: user.id,
        question,
        description,
        allow_multiple_votes: allowMultipleVotes,
        expires_at: expiresAt || null,
        is_public: isPublic
      })
      .select()
      .single();

    if (pollError) {
      console.error('Poll creation error:', pollError);
      return NextResponse.json(
        { error: "Failed to create poll" },
        { status: 500 }
      );
    }

    // Insert poll options
    const pollOptions = options.map((option: string, index: number) => ({
      poll_id: poll.id,
      option_text: option,
      display_order: index + 1
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(pollOptions);

    if (optionsError) {
      console.error('Options creation error:', optionsError);
      // Clean up the poll if options fail
      await supabase.from('polls').delete().eq('id', poll.id);
      return NextResponse.json(
        { error: "Failed to create poll options" },
        { status: 500 }
      );
    }

    // Get the complete poll with options
    const { data: completePoll, error: fetchError } = await supabase
      .rpc('get_poll_with_options', { poll_uuid: poll.id });

    if (fetchError) {
      console.error('Poll fetch error:', fetchError);
      // Return the basic poll data if fetch fails
      return NextResponse.json(
        { poll: { ...poll, options: pollOptions } },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { poll: completePoll },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


