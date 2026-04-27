import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return null;
  return dbUser;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const existing = await prisma.course.findUnique({ where: { slug: body.slug } });
  if (existing) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });

  const course = await prisma.course.create({
    data: {
      title:        body.title,
      slug:         body.slug,
      description:  body.description,
      thumbnail:    body.thumbnail || null,
      level:        body.level ?? "BEGINNER",
      price:        body.price ?? 0,
      isFree:       body.isFree ?? true,
      category:     body.category,
      tags:         body.tags ?? [],
      instructorId: admin.id,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
