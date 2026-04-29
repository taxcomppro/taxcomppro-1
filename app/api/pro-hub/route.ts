import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET — list all forums
export async function GET() {
  const forums = await prisma.forum.findMany({
    include: {
      createdBy: { select: { id: true, name: true, image: true } },
      _count: { select: { posts: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(forums);
}

// POST — create forum (ADMIN only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string; id: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, slug, description, image, isAdminOnly, isPinned, badge } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "Name and slug required" }, { status: 400 });

  const existing = await prisma.forum.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: "Slug already taken" }, { status: 409 });

  const forum = await prisma.forum.create({
    data: { name, slug, description, image, isAdminOnly: !!isAdminOnly, isPinned: !!isPinned, badge, createdById: user.id },
  });
  return NextResponse.json(forum, { status: 201 });
}
