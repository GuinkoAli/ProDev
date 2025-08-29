import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

// GET /api/polls/[id] - fetch poll details
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    // Get the complete poll with options using the helper function
    const { data: poll, error } = await supabase
      .rpc('get_poll_with_options', { poll_uuid: id });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch poll" },
        { status: 500 }
      );
    }

    if (!poll || poll.length === 0) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ poll: poll[0] });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if user owns this poll
    const { data: existingPoll, error: ownershipError } = await supabase
      .from('polls')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (ownershipError || !existingPoll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    if (existingPoll.creator_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - you can only update your own polls" },
        { status: 403 }
      );
    }

    // Update poll fields
    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (allowMultipleVotes !== undefined) updateData.allow_multiple_votes = allowMultipleVotes;
    if (expiresAt !== undefined) updateData.expires_at = expiresAt;
    if (isPublic !== undefined) updateData.is_public = isPublic;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('polls')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Poll update error:', updateError);
        return NextResponse.json(
          { error: "Failed to update poll" },
          { status: 500 }
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
        display_order: index + 1
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
      .rpc('get_poll_with_options', { poll_uuid: id });

    if (fetchError) {
      console.error('Poll fetch error:', fetchError);
      return NextResponse.json(
        { message: "Poll updated successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json({ poll: updatedPoll[0] });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    
    // Get the current user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user owns this poll
    const { data: existingPoll, error: ownershipError } = await supabase
      .from('polls')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (ownershipError || !existingPoll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    if (existingPoll.creator_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - you can only delete your own polls" },
        { status: 403 }
      );
    }

    // Delete the poll (options and votes will be cascaded)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Poll deletion error:', deleteError);
      return NextResponse.json(
        { error: "Failed to delete poll" },
        { status: 500 }
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


