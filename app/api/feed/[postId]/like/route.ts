import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    await prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.postLike.create({ data: { userId: session.user.id, postId } });
    await prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
    return NextResponse.json({ liked: true });
  }
}
