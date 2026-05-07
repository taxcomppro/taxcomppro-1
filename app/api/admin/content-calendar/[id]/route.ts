import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/content-calendar/[id] — admin removes a scheduled post
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role?: string }).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/content-calendar/[id] — publish now or reschedule
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role?: string }).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json() as { publishNow?: boolean; scheduledAt?: string };

  if (body.publishNow) {
    // Publish immediately by clearing scheduledAt
    const post = await prisma.post.update({
      where: { id },
      data: { scheduledAt: null },
      select: { id: true, scheduledAt: true },
    });
    return NextResponse.json(post);
  }

  if (body.scheduledAt) {
    const newDate = new Date(body.scheduledAt);
    if (isNaN(newDate.getTime()) || newDate <= new Date()) {
      return NextResponse.json({ error: "Must be in the future" }, { status: 400 });
    }
    const post = await prisma.post.update({
      where: { id },
      data: { scheduledAt: newDate },
      select: { id: true, scheduledAt: true },
    });
    return NextResponse.json(post);
  }

  return NextResponse.json({ error: "No action specified" }, { status: 400 });
}
