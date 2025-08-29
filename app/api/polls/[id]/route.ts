import { NextResponse } from "next/server";

// GET /api/polls/[id] - fetch poll details (placeholder)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ poll: { id }, message: "Get poll - not implemented" });
}

// PUT /api/polls/[id] - update poll (placeholder)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ poll: { id, ...body }, message: "Update poll - not implemented" });
}

// DELETE /api/polls/[id] - delete poll (placeholder)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ id, message: "Delete poll - not implemented" });
}
