import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Public GET — no auth required to browse the feed
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = 10;

  const posts = await prisma.post.findMany({
    where: { communityId: null },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: { select: { id: true, name: true, image: true, headline: true, role: true, tier: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" as const },
        take: 3,
      },
      _count: { select: { likes: true, comments: true } },
      // Only show which posts current user liked when authenticated
      likes: session
        ? { where: { userId: session.user.id }, select: { id: true } }
        : { where: { userId: "__none__" }, select: { id: true } },
    },
  });

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;
  return NextResponse.json({ posts, nextCursor });
}

// POST — requires auth to create a post
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, images, videoUrl } = await req.json();
  if (!content?.trim() && (!images?.length) && !videoUrl)
    return NextResponse.json({ error: "Content required" }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      content:  content?.trim() ?? "",
      images:   images ?? [],
      videoUrl: videoUrl ?? null,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, image: true, headline: true, role: true, tier: true } },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" as const },
        take: 3,
      },
      _count: { select: { likes: true, comments: true } },
      likes: { select: { id: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
