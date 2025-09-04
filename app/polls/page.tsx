"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSupabaseClient } from '@/lib/supabaseClient';

interface RowPollOption { id: string; }
interface RowPoll {
  id: string;
  question: string;
  creator_id: string;
  created_at: string;
  status: string;
  is_public: boolean;
  poll_options: RowPollOption[];
}

export default function PollsPage() {
  const searchParams = useSearchParams();
  const hasSuccess = Boolean(searchParams.get('success'));

  const [polls, setPolls] = useState<RowPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
        const { data, error } = await supabase
          .from('polls')
          .select(`id, question, creator_id, created_at, status, is_public, poll_options ( id )`)
          .order('created_at', { ascending: false });
        if (error) {
          setError(error.message);
          setPolls([]);
        } else {
          setPolls((data || []) as unknown as RowPoll[]);
        }
      } catch (e) {
        setError('Failed to load polls');
        setPolls([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this poll? This action cannot be undone.')) return;
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('polls').delete().eq('id', id);
      if (error) {
        alert(error.message);
        return;
      }
      setPolls((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert('Failed to delete poll');
    }
  };

  const handleEdit = async (poll: RowPoll) => {
    const newQuestion = window.prompt('Edit question', poll.question);
    if (!newQuestion || newQuestion.trim() === poll.question) return;
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('polls')
        .update({ question: newQuestion.trim() })
        .eq('id', poll.id);
      if (error) {
        alert(error.message);
        return;
      }
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? { ...p, question: newQuestion.trim() } : p)));
    } catch (e) {
      alert('Failed to update poll');
    }
  };

  return (
    <div className="container mx-auto py-10">
      {hasSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">Poll created successfully!</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Polls</h1>
        <Button asChild>
          <Link href="/polls/new">Create Poll</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-gray-500">Loading polls…</div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : !polls.length ? (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700">No polls found.</div>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll) => {
            const isOwner = currentUserId === poll.creator_id;
            const optionCount = poll.poll_options?.length || 0;
            return (
              <Card key={poll.id} className="hover:bg-gray-50">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold">
                    <Link href={`/polls/${poll.id}`} className="hover:underline">
                      {poll.question}
                    </Link>
                  </CardTitle>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(poll)}>
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => handleDelete(poll.id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{optionCount} options</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
