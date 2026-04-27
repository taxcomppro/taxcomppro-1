import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" ? user : null;
}

// PATCH — approve / reject / mark paid
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status, note } = await req.json();

  const validStatuses = ["APPROVED", "REJECTED", "PAID"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const payout = await prisma.affiliatePayout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });

  const updated = await prisma.affiliatePayout.update({
    where: { id },
    data: { status, note: note ?? payout.note, updatedAt: new Date() },
  });

  // If PAID — deduct from pendingBalance, add to totalPaid
  if (status === "PAID") {
    await prisma.affiliateProfile.update({
      where: { id: payout.affiliateId },
      data: {
        pendingBalance: { decrement: payout.amount },
        totalPaid:      { increment: payout.amount },
        updatedAt:      new Date(),
      },
    });

    // Notify the user
    const profile = await prisma.affiliateProfile.findUnique({
      where: { id: payout.affiliateId },
    });
    if (profile) {
      await prisma.notification.create({
        data: {
          userId:  profile.userId,
          type:    "upgrade",
          title:   "Payout Processed",
          message: `Your affiliate payout of $${payout.amount.toFixed(2)} has been processed.`,
        },
      });
    }
  }

  // If REJECTED — notify
  if (status === "REJECTED") {
    const profile = await prisma.affiliateProfile.findUnique({
      where: { id: payout.affiliateId },
    });
    if (profile) {
      await prisma.notification.create({
        data: {
          userId:  profile.userId,
          type:    "system",
          title:   "Payout Request Rejected",
          message: note ? `Your payout request was rejected: ${note}` : "Your payout request was rejected.",
        },
      });
    }
  }

  return NextResponse.json(updated);
}
