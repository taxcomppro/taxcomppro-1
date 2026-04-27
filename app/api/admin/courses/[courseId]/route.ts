import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return dbUser;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId } = await params;
  const body = await req.json();

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(body.title            !== undefined ? { title:            body.title }              : {}),
      ...(body.slug             !== undefined ? { slug:             body.slug }               : {}),
      ...(body.description      !== undefined ? { description:      body.description }        : {}),
      ...(body.thumbnail        !== undefined ? { thumbnail:        body.thumbnail || null }  : {}),
      ...(body.level            !== undefined ? { level:            body.level }              : {}),
      ...(body.price            !== undefined ? { price:            body.price }              : {}),
      ...(body.isFree           !== undefined ? { isFree:           body.isFree }             : {}),
      ...(body.category         !== undefined ? { category:         body.category }           : {}),
      ...(body.tags             !== undefined ? { tags:             body.tags }               : {}),
      ...(body.status           !== undefined ? { status:           body.status }             : {}),
      ...(body.isSequential     !== undefined ? { isSequential:     body.isSequential }       : {}),
      ...(body.learningOutcomes !== undefined ? { learningOutcomes: body.learningOutcomes }   : {}),
      ...(body.requirements     !== undefined ? { requirements:     body.requirements }       : {}),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { courseId } = await params;
  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ success: true });
}
