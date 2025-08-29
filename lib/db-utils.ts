import { getSupabaseClient } from './supabaseClient';
import type { 
  PollWithOptions, 
  UserPoll, 
  PublicPoll, 
  CreatePollRequest,
  UpdatePollRequest 
} from './types';

export class DatabaseError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Get a poll with all its options and vote counts
 */
export async function getPollWithOptions(pollId: string): Promise<PollWithOptions> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .rpc('get_poll_with_options', { poll_uuid: pollId });

  if (error) {
    console.error('Error fetching poll:', error);
    throw new DatabaseError('Failed to fetch poll', 500);
  }

  if (!data || data.length === 0) {
    throw new DatabaseError('Poll not found', 404);
  }

  return data[0];
}

/**
 * Get all polls created by a specific user
 */
export async function getUserPolls(userId: string): Promise<UserPoll[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .rpc('get_user_polls', { user_uuid: userId });

  if (error) {
    console.error('Error fetching user polls:', error);
    throw new DatabaseError('Failed to fetch user polls', 500);
  }

  return data || [];
}

/**
 * Create a new poll with options
 */
export async function createPoll(
  userId: string, 
  pollData: CreatePollRequest
): Promise<PollWithOptions> {
  const supabase = getSupabaseClient();
  
  // Ensure user has a profile
  await ensureUserProfile(userId);

  // Insert the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      creator_id: userId,
      question: pollData.question,
      description: pollData.description,
      allow_multiple_votes: pollData.allowMultipleVotes || false,
      expires_at: pollData.expiresAt || null,
      is_public: pollData.isPublic !== false
    })
    .select()
    .single();

  if (pollError) {
    console.error('Error creating poll:', pollError);
    throw new DatabaseError('Failed to create poll', 500);
  }

  // Insert poll options
  const pollOptions = pollData.options.map((option, index) => ({
    poll_id: poll.id,
    option_text: option,
    display_order: index + 1
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(pollOptions);

  if (optionsError) {
    console.error('Error creating poll options:', optionsError);
    // Clean up the poll if options fail
    await supabase.from('polls').delete().eq('id', poll.id);
    throw new DatabaseError('Failed to create poll options', 500);
  }

  // Return the complete poll
  return getPollWithOptions(poll.id);
}

/**
 * Update an existing poll
 */
export async function updatePoll(
  pollId: string,
  userId: string,
  updateData: UpdatePollRequest
): Promise<PollWithOptions> {
  const supabase = getSupabaseClient();
  
  // Check ownership
  await checkPollOwnership(pollId, userId);

  // Update poll fields
  const updateFields: any = {};
  if (updateData.question !== undefined) updateFields.question = updateData.question;
  if (updateData.description !== undefined) updateFields.description = updateData.description;
  if (updateData.status !== undefined) updateFields.status = updateData.status;
  if (updateData.allowMultipleVotes !== undefined) updateFields.allow_multiple_votes = updateData.allowMultipleVotes;
  if (updateData.expiresAt !== undefined) updateFields.expires_at = updateData.expiresAt;
  if (updateData.isPublic !== undefined) updateFields.is_public = updateData.isPublic;

  if (Object.keys(updateFields).length > 0) {
    const { error: updateError } = await supabase
      .from('polls')
      .update(updateFields)
      .eq('id', pollId);

    if (updateError) {
      console.error('Error updating poll:', updateError);
      throw new DatabaseError('Failed to update poll', 500);
    }
  }

  // Update options if provided
  if (updateData.options && Array.isArray(updateData.options)) {
    await updatePollOptions(pollId, updateData.options);
  }

  // Return the updated poll
  return getPollWithOptions(pollId);
}

/**
 * Delete a poll
 */
export async function deletePoll(pollId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Check ownership
  await checkPollOwnership(pollId, userId);

  // Delete the poll (options and votes will be cascaded)
  const { error: deleteError } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (deleteError) {
    console.error('Error deleting poll:', deleteError);
    throw new DatabaseError('Failed to delete poll', 500);
  }
}

/**
 * Record a vote on a poll
 */
export async function recordVote(
  pollId: string,
  optionId: string,
  userId: string
): Promise<PollWithOptions> {
  const supabase = getSupabaseClient();
  
  // Ensure user has a profile
  await ensureUserProfile(userId);

  // Use the helper function to record the vote
  const { error: voteError } = await supabase
    .rpc('record_vote', {
      poll_uuid: pollId,
      option_uuid: optionId,
      voter_uuid: userId
    });

  if (voteError) {
    console.error('Error recording vote:', voteError);
    
    // Handle specific error cases
    if (voteError.message?.includes('Poll not found')) {
      throw new DatabaseError('Poll not found', 404);
    }
    if (voteError.message?.includes('Poll is not active')) {
      throw new DatabaseError('Poll is not active', 400);
    }
    if (voteError.message?.includes('Poll is not public')) {
      throw new DatabaseError('Poll is not public', 403);
    }
    if (voteError.message?.includes('Invalid option')) {
      throw new DatabaseError('Invalid option for this poll', 400);
    }
    if (voteError.message?.includes('already voted')) {
      throw new DatabaseError('You have already voted on this poll', 400);
    }
    
    throw new DatabaseError('Failed to record vote', 500);
  }

  // Return the updated poll
  return getPollWithOptions(pollId);
}

/**
 * Get public active polls
 */
export async function getPublicPolls(
  limit: number = 20,
  offset: number = 0
): Promise<{ polls: PublicPoll[]; pagination: { limit: number; offset: number; hasMore: boolean } }> {
  const supabase = getSupabaseClient();
  
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
    console.error('Error fetching public polls:', error);
    throw new DatabaseError('Failed to fetch public polls', 500);
  }

  return {
    polls: polls || [],
    pagination: {
      limit,
      offset,
      hasMore: (polls?.length || 0) === limit
    }
  };
}

/**
 * Check if a user has voted on a specific poll
 */
export async function getUserVote(pollId: string, userId: string): Promise<{ hasVoted: boolean; vote: any }> {
  const supabase = getSupabaseClient();
  
  const { data: vote, error } = await supabase
    .from('votes')
    .select('option_id, created_at')
    .eq('poll_id', pollId)
    .eq('voter_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user vote:', error);
    throw new DatabaseError('Failed to fetch user vote', 500);
  }

  return {
    hasVoted: !!vote,
    vote: vote || null
  };
}

// Helper functions

async function ensureUserProfile(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    // Get user info from auth
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        });

      if (insertProfileError) {
        console.error('Error creating user profile:', insertProfileError);
        throw new DatabaseError('Failed to create user profile', 500);
      }
    }
  }
}

async function checkPollOwnership(pollId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { data: poll, error } = await supabase
    .from('polls')
    .select('creator_id')
    .eq('id', pollId)
    .single();

  if (error || !poll) {
    throw new DatabaseError('Poll not found', 404);
  }

  if (poll.creator_id !== userId) {
    throw new DatabaseError('Forbidden - you can only modify your own polls', 403);
  }
}

async function updatePollOptions(pollId: string, options: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Delete existing options
  const { error: deleteError } = await supabase
    .from('poll_options')
    .delete()
    .eq('poll_id', pollId);

  if (deleteError) {
    console.error('Error deleting poll options:', deleteError);
    throw new DatabaseError('Failed to update poll options', 500);
  }

  // Insert new options
  const pollOptions = options.map((option, index) => ({
    poll_id: pollId,
    option_text: option,
    display_order: index + 1
  }));

  const { error: insertError } = await supabase
    .from('poll_options')
    .insert(pollOptions);

  if (insertError) {
    console.error('Error inserting poll options:', insertError);
    throw new DatabaseError('Failed to update poll options', 500);
  }
}
