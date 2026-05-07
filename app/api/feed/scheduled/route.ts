import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/feed/scheduled — user's pending scheduled posts
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: {
      authorId:    session.user.id,
      scheduledAt: { not: null, gt: new Date() }, // only future
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true, content: true, images: true, videoUrl: true,
      scheduledAt: true, createdAt: true,
    },
  });

  return NextResponse.json(posts);
}
