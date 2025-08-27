import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PollPageProps {
  params: { id: string };
}

export default function PollDetailPage({ params }: PollPageProps) {
  const { id } = params;
  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Poll #{id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">Question goes here.</p>
          <div className="space-y-2">
            {[
              { id: "a", label: "Option A" },
              { id: "b", label: "Option B" },
            ].map((opt) => (
              <Button key={opt.id} variant="secondary" className="w-full justify-start">
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500">Placeholder poll. Voting not wired yet.</p>
        </CardFooter>
      </Card>
    </div>
  );
}


