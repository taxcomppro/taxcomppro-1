import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

// GET  /api/spaces — list all live spaces
export async function GET() {
  const spaces = await prisma.space.findMany({
    where: { isLive: true },
    orderBy: { createdAt: "desc" },
    include: {
      host: { select: { id: true, name: true, image: true, headline: true } },
    },
  });
  return NextResponse.json(spaces);
}

// POST /api/spaces — admin creates a new space
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const roomName = `space-${nanoid(10)}`;

  const space = await prisma.space.create({
    data: {
      name:        name.trim(),
      description: description?.trim() ?? null,
      hostId:      session.user.id,
      roomName,
    },
    include: {
      host: { select: { id: true, name: true, image: true, headline: true } },
    },
  });

  return NextResponse.json(space, { status: 201 });
}
