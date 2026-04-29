import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string; postId: string }> };

// POST — toggle vote on a post: +1 upvote, -1 downvote, 0 remove
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const user = session.user as { id: string };
  const { value } = await req.json(); // +1 or -1

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "Value must be 1 or -1" }, { status: 400 });
  }

  const existing = await prisma.forumVote.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  let delta = 0;

  if (!existing) {
    // New vote
    await prisma.forumVote.create({ data: { postId, userId: user.id, value } });
    delta = value;
  } else if (existing.value === value) {
    // Same direction — remove vote (toggle off)
    await prisma.forumVote.delete({ where: { postId_userId: { postId, userId: user.id } } });
    delta = -value;
  } else {
    // Flip direction
    await prisma.forumVote.update({ where: { postId_userId: { postId, userId: user.id } }, data: { value } });
    delta = value * 2; // e.g. -1 → +1 is +2
  }

  const updated = await prisma.forumPost.update({
    where: { id: postId },
    data: { votes: { increment: delta } },
    select: { votes: true },
  });

  const myVote = existing?.value === value ? 0 : value;

  return NextResponse.json({ votes: updated.votes, myVote });
}
