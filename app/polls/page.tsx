import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PollsListPage() {
  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Latest Polls</h1>
        <Link className="underline" href="/polls/new">Create a poll</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3].map((id) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>Poll #{id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Short description...</p>
              <Link className="mt-2 inline-block underline" href={`/polls/${id}`}>View details</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


