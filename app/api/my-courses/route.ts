import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, image: true } },
          sections: { include: { _count: { select: { lessons: true } } } },
        },
      },
      progress: { select: { lessonId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = enrollments.map((e) => {
    const totalLessons = e.course.sections.reduce((sum, s) => sum + s._count.lessons, 0);
    const completedCount = e.progress.length;
    return {
      id:              e.id,
      enrolledAt:      e.createdAt,
      completedAt:     e.completedAt,
      progressPercent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      completedCount,
      totalLessons,
      course: {
        id:           e.course.id,
        slug:         e.course.slug,
        title:        e.course.title,
        thumbnail:    e.course.thumbnail,
        level:        e.course.level,
        category:     e.course.category,
        instructor:   e.course.instructor,
      },
    };
  });

  return NextResponse.json(result);
}
