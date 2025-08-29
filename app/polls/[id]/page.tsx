import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/qr-code";
import { headers } from "next/headers";

interface PollPageProps {
  params: Promise<{ id: string }>;
}

export default async function PollDetailPage({ params }: PollPageProps) {
  const { id } = await params;
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const proto = (hdrs.get("x-forwarded-proto") || "http").split(",")[0];
  const shareUrl = `${proto}://${host}/polls/${id}`;
  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Poll #{id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="pt-2">
            <p className="text-sm font-medium">Share this poll</p>
            <div className="mt-2 flex items-center gap-4">
              <QrCode url={shareUrl} />
              <a className="text-sm underline" href={shareUrl}>
                {shareUrl}
              </a>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-gray-500">Placeholder poll. Voting not wired yet.</p>
        </CardFooter>
      </Card>
    </div>
  );
}


