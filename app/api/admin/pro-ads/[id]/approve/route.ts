import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/pro-ads/[id]/approve
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const ad = await prisma.proAd.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const startsAt = ad.startsAt ?? new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + ad.durationMonths);

  await prisma.proAd.update({
    where: { id },
    data: { status: "ACTIVE", startsAt, endsAt },
  });

  await prisma.notification.create({
    data: {
      userId:  ad.userId,
      type:    "AD_APPROVED",
      title:   "Your Ad is Now Live! 🎉",
      message: `"${ad.title}" is now running on the platform for ${ad.durationMonths} month(s).`,
      link:    "/pro-marketing",
    },
  });

  return NextResponse.json({ ok: true });
}
