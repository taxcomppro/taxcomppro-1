import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/pro-ads/[id]/reject  { reason? }
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { reason } = await req.json().catch(() => ({ reason: "" })) as { reason?: string };

  const ad = await prisma.proAd.findUnique({ where: { id } });
  if (!ad) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.proAd.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason?.trim() ?? null },
  });

  await prisma.notification.create({
    data: {
      userId:  ad.userId,
      type:    "AD_REJECTED",
      title:   "Ad Rejected",
      message: reason?.trim()
        ? `Your ad "${ad.title}" was rejected: ${reason.trim()}`
        : `Your ad "${ad.title}" was rejected by an admin.`,
      link: "/pro-marketing",
    },
  });

  return NextResponse.json({ ok: true });
}
