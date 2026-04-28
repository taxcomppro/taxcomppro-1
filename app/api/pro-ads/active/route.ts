import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pro-ads/active?placement=CENTER_COLUMN
// Public — returns currently active ads for display in feed/sidebar
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get("placement") as "CENTER_COLUMN" | "LEFT_COLUMN" | null;

  const now = new Date();

  const ads = await prisma.proAd.findMany({
    where: {
      status: "ACTIVE",
      ...(placement ? { placement } : {}),
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    select: {
      id: true, title: true, description: true,
      imageUrl: true, linkUrl: true, placement: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ads);
}
