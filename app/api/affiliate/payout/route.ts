import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list user's payout history
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json([]);

  const payouts = await prisma.affiliatePayout.findMany({
    where: { affiliateId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payouts);
}

// POST — submit payout request
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, method, details } = await req.json();
  if (!amount || !details) {
    return NextResponse.json({ error: "Amount and payout details are required" }, { status: 400 });
  }

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json({ error: "No affiliate profile" }, { status: 404 });

  // Check minimum payout
  const settings = await prisma.affiliateSettings.findFirst();
  const minPayout = settings?.minPayoutAmount ?? 50;
  if (profile.pendingBalance < minPayout) {
    return NextResponse.json(
      { error: `Minimum payout is $${minPayout}. Current balance: $${profile.pendingBalance.toFixed(2)}` },
      { status: 400 }
    );
  }
  if (amount > profile.pendingBalance) {
    return NextResponse.json({ error: "Amount exceeds pending balance" }, { status: 400 });
  }

  // Check no pending payout already
  const existing = await prisma.affiliatePayout.findFirst({
    where: { affiliateId: profile.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending payout request" }, { status: 409 });
  }

  const payout = await prisma.affiliatePayout.create({
    data: {
      affiliateId: profile.id,
      amount,
      method: method ?? "paypal",
      details,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(payout, { status: 201 });
}
