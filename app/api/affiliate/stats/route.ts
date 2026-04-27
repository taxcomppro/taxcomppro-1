import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      referrals: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          referredUser: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  if (!profile) return NextResponse.json({ error: "No affiliate profile" }, { status: 404 });

  return NextResponse.json({
    totalEarned:    profile.totalEarned,
    pendingBalance: profile.pendingBalance,
    totalPaid:      profile.totalPaid,
    totalReferrals: profile.referrals.length,
    referrals:      profile.referrals,
  });
}
