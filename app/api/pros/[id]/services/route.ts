import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET — list services for a pro
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const services = await prisma.proService.findMany({
    where: { userId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(services);
}

// POST — create a service (owner only)
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.id !== id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, price, emoji } = await req.json() as {
    title: string; description?: string; price?: string; emoji?: string;
  };
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const count = await prisma.proService.count({ where: { userId: id } });
  const svc = await prisma.proService.create({
    data: { userId: id, title: title.trim(), description: description?.trim(), price: price?.trim(), emoji: emoji ?? "⭐", order: count },
  });
  return NextResponse.json(svc, { status: 201 });
}
