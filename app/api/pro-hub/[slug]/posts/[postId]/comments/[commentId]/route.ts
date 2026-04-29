import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string; postId: string; commentId: string }> };

// DELETE — delete a comment (owner or admin)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const user = session.user as { id: string; role?: string };

  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.authorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.forumComment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
