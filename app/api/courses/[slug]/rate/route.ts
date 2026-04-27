import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rating, review } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  if (!enrollment) return NextResponse.json({ error: "Enroll in this course to leave a rating" }, { status: 403 });

  const saved = await prisma.courseRating.upsert({
    where:  { userId_courseId: { userId: session.user.id, courseId: course.id } },
    create: { userId: session.user.id, courseId: course.id, rating, review: review?.trim() || null },
    update: { rating, review: review?.trim() || null },
  });

  return NextResponse.json(saved);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ratings = await prisma.courseRating.findMany({
    where: { courseId: course.id },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const avg = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
    : 0;

  // User's own rating
  let userRating = null;
  if (session?.user) {
    userRating = ratings.find(r => r.userId === session.user.id) ?? null;
  }

  return NextResponse.json({ ratings, avg: Math.round(avg * 10) / 10, count: ratings.length, userRating });
}
