import { getSupabaseClient } from './supabaseClient';
import { Poll } from './types';
import { toErrorMessage } from './utils';

export async function createPoll(question: string, options: string[], creator_id: string): Promise<Poll> {
  const supabase = getSupabaseClient();

  const { data: pollData, error: pollError } = await supabase
    .from('polls')
    .insert([{ question, creator_id }])
    .select();

  if (pollError) {
    throw new Error(pollError.message);
  }

  const poll = pollData[0];

  const pollOptions = options.map((option_text, display_order) => ({
    poll_id: poll.id,
    option_text,
    display_order,
  }));

  const { data: optionsData, error: optionsError } = await supabase
    .from('poll_options')
    .insert(pollOptions)
    .select();

  if (optionsError) {
    // If creating options fails, delete the poll to maintain consistency
    await supabase.from('polls').delete().match({ id: poll.id });
    throw new Error(optionsError.message);
  }

  return {
    ...poll,
    options: optionsData,
  };
}

export async function getPolls(): Promise<Poll[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('polls')
      .select('*, options:poll_options(*)');

    if (error) {
      console.error(`getPolls error: ${error.message}`);
      return [];
    }

    return data as unknown as Poll[];
  } catch (err) {
    console.error(`getPolls exception: ${toErrorMessage(err)}`);
    return [];
  }
}
