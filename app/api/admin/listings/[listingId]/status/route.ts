import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin only
  const caller = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (caller?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { listingId } = await params;
  const { status } = await req.json();
  const valid = ["PENDING", "APPROVED", "REJECTED"];
  if (!valid.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const updated = await prisma.marketplaceListing.update({
    where: { id: listingId },
    data: { status },
    select: { id: true, title: true, status: true },
  });

  return NextResponse.json(updated);
}
