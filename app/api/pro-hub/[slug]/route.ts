import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET — forum detail + paginated posts
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const sort   = searchParams.get("sort") ?? "hot"; // hot | new | top
  const page   = parseInt(searchParams.get("page") ?? "1");
  const limit  = 20;
  const skip   = (page - 1) * limit;

  const forum = await prisma.forum.findUnique({
    where: { slug },
    include: {
      createdBy: { select: { id: true, name: true, image: true } },
      _count: { select: { posts: true } },
    },
  });
  if (!forum) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const orderBy =
    sort === "top"  ? { votes: "desc" as const } :
    sort === "new"  ? { createdAt: "desc" as const } :
    /* hot */         { votes: "desc" as const };

  const posts = await prisma.forumPost.findMany({
    where: { forumId: forum.id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ isPinned: "desc" }, orderBy],
    skip,
    take: limit,
  });

  return NextResponse.json({ forum, posts });
}

// PATCH — update forum (ADMIN)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const body = await req.json();
  const forum = await prisma.forum.update({
    where: { slug },
    data: {
      name: body.name, description: body.description, image: body.image,
      isAdminOnly: body.isAdminOnly, isPinned: body.isPinned, badge: body.badge,
    },
  });
  return NextResponse.json(forum);
}

// DELETE — delete forum (ADMIN)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  await prisma.forum.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
