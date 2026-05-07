import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/feed/scheduled/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true, scheduledAt: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!post.scheduledAt) return NextResponse.json({ error: "Post is already published" }, { status: 400 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/feed/scheduled/[id] — reschedule
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { scheduledAt } = await req.json();

  const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const newDate = new Date(scheduledAt);
  if (isNaN(newDate.getTime()) || newDate <= new Date()) {
    return NextResponse.json({ error: "Must be in the future" }, { status: 400 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { scheduledAt: newDate },
    select: { id: true, scheduledAt: true },
  });

  return NextResponse.json(updated);
}
