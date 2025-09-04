'use server';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPoll(prevState: any, formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Settings.' };
  }
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to create a poll.' };
  }

  const question = formData.get('question') as string;
  const description = formData.get('description') as string;
  const options = formData.getAll('options[]').filter(opt => String(opt).trim()) as string[];

  if (!question || options.length < 2) {
    return { error: 'A question and at least two options are required.' };
  }

  // 1. Insert the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      creator_id: user.id,
      question,
      description,
    })
    .select('id')
    .single();

  if (pollError) {
    console.error('Error creating poll:', pollError);
    return { error: 'Failed to create poll. Please try again.' };
  }

  // 2. Insert the poll options
  const pollOptions = options.map((option, index) => ({
    poll_id: poll.id,
    option_text: option,
    display_order: index,
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(pollOptions);

  if (optionsError) {
    console.error('Error adding poll options:', optionsError);
    // Here you might want to delete the poll that was just created for consistency
    await supabase.from('polls').delete().eq('id', poll.id);
    return { error: 'Failed to create poll options. Please try again.' };
  }

  // 3. Revalidate the polls page and redirect to list with success
  revalidatePath('/polls');
  redirect('/polls?success=1');
}
