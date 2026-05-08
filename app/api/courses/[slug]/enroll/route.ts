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

  const course = await prisma.course.findUnique({ where: { slug, status: "PUBLISHED" } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Paid courses must go through Stripe checkout — reject direct enrollment
  if (!course.isFree && course.price > 0)
    return NextResponse.json({ error: "Payment required", requiresPayment: true }, { status: 402 });

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

  const enrollment = await prisma.enrollment.create({
    data: { userId: session.user.id, courseId: course.id },
  });

  // Notify the course instructor
  await prisma.notification.create({
    data: {
      userId:  course.instructorId,
      type:    "ENROLLMENT",
      title:   "New Enrollment",
      message: `Someone enrolled in your course: ${course.title}`,
      link:    `/courses/${course.slug}`,
    },
  }).catch(() => {});

  return NextResponse.json({ success: true, enrollmentId: enrollment.id }, { status: 201 });
}
