import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: new Headers(req.headers) });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url   = new URL(req.url);
  const type  = url.searchParams.get("type") ?? "all"; // "images" | "videos" | "all"
  const page  = parseInt(url.searchParams.get("page") ?? "1");
  const limit = 48;
  const skip  = (page - 1) * limit;

  const base = { communityId: null, scheduledAt: null };

  const where =
    type === "images" ? { ...base, images: { isEmpty: false } } :
    type === "videos" ? { ...base, videoUrl: { not: null } } :
    { ...base, OR: [{ images: { isEmpty: false } }, { videoUrl: { not: null } }] };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, images: true, videoUrl: true, content: true, createdAt: true,
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
}
