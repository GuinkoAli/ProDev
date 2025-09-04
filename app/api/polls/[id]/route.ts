import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

// GET /api/polls/[id] - fetch poll details
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getSupabaseClient();

    // Get the complete poll with options using the helper function
    const { data: poll, error } = await supabase
      .rpc('get_poll_with_options', { poll_uuid: id })
      .single();

    if (error) {
      // PGRST116: "The result contains 0 rows" - this is the expected error when no poll is found or RLS prevents access.
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch poll" },
        { status: 500 }
      );
    }

    return NextResponse.json({ poll });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/polls/[id] - update poll
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
    const { question, description, status, allowMultipleVotes, expiresAt, isPublic, options } = body;

    // Update poll fields
    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (allowMultipleVotes !== undefined) updateData.allow_multiple_votes = allowMultipleVotes;
    if (expiresAt !== undefined) updateData.expires_at = expiresAt;
    if (isPublic !== undefined) updateData.is_public = isPublic;

    if (Object.keys(updateData).length > 0) {
      // The RLS policy "Users can update their own polls." ensures this only succeeds for the creator.
      // We chain .select().single() to check if a row was actually updated.
      const { error: updateError } = await supabase
        .from('polls')
        .update(updateData)
        .eq('id', id)
        .select('id')
        .single();

      if (updateError) {
        // If no row is found that matches the id AND the RLS policy, a PGRST116 error is returned.
        if (updateError.code === 'PGRST116') {
          return NextResponse.json({ error: "Poll not found or permission denied" }, { status: 404 });
        }
        console.error('Poll update error:', updateError);
        return NextResponse.json(
          { error: "Failed to update poll" }, { status: 500 }
        );
      }
    }

    // Update options if provided
    if (options && Array.isArray(options)) {
      // Delete existing options
      const { error: deleteOptionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', id);

      if (deleteOptionsError) {
        console.error('Options deletion error:', deleteOptionsError);
        return NextResponse.json(
          { error: "Failed to update poll options" },
          { status: 500 }
        );
      }

      // Insert new options
      const pollOptions = options.map((option: string, index: number) => ({
        poll_id: id,
        option_text: option,
        display_order: index
      }));

      const { error: insertOptionsError } = await supabase
        .from('poll_options')
        .insert(pollOptions);

      if (insertOptionsError) {
        console.error('Options insertion error:', insertOptionsError);
        return NextResponse.json(
          { error: "Failed to update poll options" },
          { status: 500 }
        );
      }
    }

    // Get the updated poll
    const { data: updatedPoll, error: fetchError } = await supabase
      .rpc('get_poll_with_options', { poll_uuid: id })
      .single();

    if (fetchError || !updatedPoll) {
      console.error('Poll fetch error:', fetchError);
      return NextResponse.json(
        { error: "Failed to fetch updated poll" },
        { status: 500 }
      );
    }

    return NextResponse.json({ poll: updatedPoll });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/polls/[id] - delete poll
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getSupabaseClient();
    
    // Get the current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // The RLS policy "Users can delete their own polls." ensures this only succeeds for the creator.
    // The ON DELETE CASCADE on foreign keys will clean up related options and votes.
    // We chain .select().single() to check if a row was actually deleted.
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (deleteError) {
      // If no row is found that matches the id AND the RLS policy, a PGRST116 error is returned.
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: "Poll not found or permission denied" }, { status: 404 });
      }
      console.error('Poll deletion error:', deleteError);
      return NextResponse.json(
        { error: "Failed to delete poll" }, { status: 500 }
      );
    }

    return NextResponse.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}