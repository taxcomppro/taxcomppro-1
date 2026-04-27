import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/spaces/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const space = await prisma.space.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true, image: true, headline: true } },
    },
  });
  if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(space);
}

// DELETE /api/spaces/[id] — admin ends a space
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.space.update({
    where: { id },
    data: { isLive: false, endedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
