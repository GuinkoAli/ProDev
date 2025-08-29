import { NextResponse } from "next/server";

// GET /api/polls - list current user's polls (placeholder)
export async function GET() {
  return NextResponse.json({ polls: [], message: "List polls - not implemented" });
}

// POST /api/polls - create a poll (placeholder)
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(
    { poll: { id: "temp-id", ...body }, message: "Create poll - not implemented" },
    { status: 201 }
  );
}
