import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const canSell = user?.tier === "MARKETPLACE" || user?.tier === "MARKETPLACE_PLUS" || user?.role === "ADMIN";
  if (!canSell) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const listings = await prisma.marketplaceListing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}
