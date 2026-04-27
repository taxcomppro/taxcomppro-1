import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      instructor: { select: { id: true, name: true, image: true, headline: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
              orderBy: { order: "asc" },
              include: {
                quiz: {
                  include: { questions: { orderBy: { order: "asc" } } },
                },
              },
            },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (course.status !== "PUBLISHED") {
    const dbUser = session?.user ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  let enrollment = null;
  let completedLessonIds: string[] = [];

  if (session?.user) {
    enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      include: { progress: { select: { lessonId: true } } },
    });
    if (enrollment) {
      completedLessonIds = enrollment.progress.map((p) => p.lessonId);
    }
  }

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  // Ratings
  const ratings = await prisma.courseRating.findMany({
    where: { courseId: course.id },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const avgRating = ratings.length > 0
    ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
    : 0;
  const userRating = session?.user ? (ratings.find(r => r.userId === session.user.id) ?? null) : null;

  return NextResponse.json({
    ...course,
    totalLessons,
    isEnrolled: !!enrollment,
    completedLessonIds,
    progressPercent: totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0,
    ratings,
    avgRating,
    ratingCount: ratings.length,
    userRating,
  });
}
