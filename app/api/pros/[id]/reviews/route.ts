import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET — public: list reviews for a pro
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const reviews = await prisma.proReview.findMany({
    where: { proId: id },
    include: {
      reviewer: { select: { id: true, name: true, image: true, headline: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reviews);
}

// POST — leave a review (must be connected / logged in, cannot review self)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.id === id) return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });

  const { rating, content } = await req.json() as { rating: number; content: string };
  if (!content?.trim()) return NextResponse.json({ error: "Review text required" }, { status: 400 });
  if (typeof rating !== "number" || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  const existing = await prisma.proReview.findUnique({
    where: { proId_reviewerId: { proId: id, reviewerId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

  const review = await prisma.proReview.create({
    data: { proId: id, reviewerId: session.user.id, rating, content: content.trim() },
    include: { reviewer: { select: { id: true, name: true, image: true, headline: true } } },
  });
  return NextResponse.json(review, { status: 201 });
}
