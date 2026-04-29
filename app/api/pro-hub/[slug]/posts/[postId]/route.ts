import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string; postId: string }> };

// GET — full post with nested comments
export async function GET(req: NextRequest, { params }: Params) {
  const { postId } = await params;

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, image: true, headline: true } },
      forum:  { select: { id: true, name: true, slug: true, image: true } },
      comments: {
        where: { parentId: null }, // top-level only
        include: {
          author: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, image: true } },
              replies: {
                include: { author: { select: { id: true, name: true, image: true } } },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { votes: "desc" },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

// DELETE — delete post (owner or admin)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const user = session.user as { id: string; role?: string };

  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.forumPost.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
