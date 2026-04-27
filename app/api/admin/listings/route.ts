import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return null;
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return u?.role === "ADMIN" ? session : null;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "ALL";
  const search = searchParams.get("search") ?? "";

  const listings = await prisma.marketplaceListing.findMany({
    where: {
      ...(status !== "ALL" ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
      ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }] } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(listings);
}
