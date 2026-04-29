import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string; postId: string }> };

// POST — add comment or reply
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const user = session.user as { id: string };
  const { body, parentId } = await req.json();

  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });

  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const comment = await prisma.forumComment.create({
    data: { body: body.trim(), postId, authorId: user.id, parentId: parentId ?? null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: { author: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
