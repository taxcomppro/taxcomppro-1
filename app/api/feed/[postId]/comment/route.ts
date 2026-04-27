import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { author: { select: { id: true, name: true, image: true, headline: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Comment required" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { content: content.trim(), authorId: session.user.id, postId },
    include: { author: { select: { id: true, name: true, image: true, headline: true } } },
  });

  await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
  return NextResponse.json(comment, { status: 201 });
}
