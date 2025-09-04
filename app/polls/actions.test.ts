import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPoll } from './actions';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Mock the modules
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerActionClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('createPoll action', () => {
  let supabaseMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    supabaseMock = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    (createServerActionClient as vi.Mock).mockReturnValue(supabaseMock);
  });

  it('should create a poll successfully', async () => {
    const formData = new FormData();
    formData.append('question', 'What is your favorite color?');
    formData.append('options[]', 'Red');
    formData.append('options[]', 'Blue');

    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });

    const pollsFromMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'poll-123' }, error: null }),
    };
    const optionsFromMock = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    supabaseMock.from.mockImplementation((tableName: string) => {
      if (tableName === 'polls') return pollsFromMock;
      if (tableName === 'poll_options') return optionsFromMock;
      return {};
    });

    await createPoll({}, formData);

    expect(pollsFromMock.insert).toHaveBeenCalledWith(expect.objectContaining({ question: 'What is your favorite color?' }));
    expect(pollsFromMock.select).toHaveBeenCalledWith('id');
    expect(optionsFromMock.insert).toHaveBeenCalledWith([
      { poll_id: 'poll-123', option_text: 'Red', display_order: 0 },
      { poll_id: 'poll-123', option_text: 'Blue', display_order: 1 },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith('/polls');
    expect(redirect).toHaveBeenCalledWith('/polls?success=1');
  });

  it('should return an error if user is not logged in', async () => {
    const formData = new FormData();
    formData.append('question', 'Test question');
    formData.append('options[]', 'Option 1');
    formData.append('options[]', 'Option 2');

    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await createPoll({}, formData);

    expect(result.error).toBe('You must be logged in to create a poll.');
  });

  it('should return an error for invalid form data', async () => {
    const formData = new FormData();
    formData.append('question', ''); // Invalid question
    formData.append('options[]', 'Option 1');

    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });

    const result = await createPoll({}, formData);

    expect(result.error).toBe('A question and at least two options are required.');
  });

  it('should return an error if poll insertion fails', async () => {
    const formData = new FormData();
    formData.append('question', 'Test question');
    formData.append('options[]', 'Option 1');
    formData.append('options[]', 'Option 2');

    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });

    const pollsFromMock = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    };

    supabaseMock.from.mockImplementation((tableName: string) => {
      if (tableName === 'polls') return pollsFromMock;
      return {};
    });

    const result = await createPoll({}, formData);

    expect(result.error).toBe('Failed to create poll. Please try again.');
  });
});
