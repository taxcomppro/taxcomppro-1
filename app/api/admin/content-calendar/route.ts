import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/content-calendar
// Returns all scheduled (future) posts across all users — admin only
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role?: string }).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "2026-05" format, optional

  let gte: Date | undefined;
  let lte: Date | undefined;

  if (month) {
    const [y, m] = month.split("-").map(Number);
    gte = new Date(y, m - 1, 1);
    lte = new Date(y, m, 0, 23, 59, 59);
  }

  const posts = await prisma.post.findMany({
    where: {
      scheduledAt: {
        not: null,
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      },
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      author: { select: { id: true, name: true, image: true, email: true, role: true } },
    },
  });

  return NextResponse.json(posts);
}
