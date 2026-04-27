import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; sid: string }> };

// DELETE — remove a service (owner only)
export async function DELETE(req: NextRequest, { params }: Params) {
  const { sid } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await prisma.proService.findUnique({ where: { id: sid } });
  if (!svc || svc.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.proService.delete({ where: { id: sid } });
  return NextResponse.json({ success: true });
}

// PATCH — update a service
export async function PATCH(req: NextRequest, { params }: Params) {
  const { sid } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = await prisma.proService.findUnique({ where: { id: sid } });
  if (!svc || svc.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, price, emoji } = await req.json() as Record<string, string>;
  const updated = await prisma.proService.update({
    where: { id: sid },
    data: { title, description, price, emoji },
  });
  return NextResponse.json(updated);
}
