import { NextResponse } from "next/server";

// POST /api/polls/[id]/vote - record a vote (placeholder)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ pollId: id, vote: body, message: "Vote - not implemented" });
}
