import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsersWeek,
    totalListings, pendingListings,
    totalCommunities, newCommunitiesWeek,
    totalSubscriptions, activeSubscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.marketplaceListing.count(),
    prisma.marketplaceListing.count({ where: { status: "PENDING" } }),
    prisma.community.count(),
    prisma.community.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "active" } }),
  ]);

  // Revenue: count active subscriptions (simplified; real would sum Stripe amounts)
  const tierCounts = await prisma.user.groupBy({
    by: ["tier"],
    _count: { tier: true },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, tier: true, image: true, createdAt: true },
  });

  const recentPending = await prisma.marketplaceListing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    totalUsers, newUsersWeek,
    totalListings, pendingListings,
    totalCommunities, newCommunitiesWeek,
    totalSubscriptions, activeSubscriptions,
    tierCounts,
    recentUsers,
    recentPending,
  });
}
