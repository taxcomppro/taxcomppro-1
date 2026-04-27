import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try slug first, fall back to ID for backward compat
  const listing = await prisma.marketplaceListing.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: "APPROVED",
    },
    include: {
      user: { select: { id: true, name: true, image: true, headline: true, role: true, tier: true } },
    },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count (fire-and-forget)
  prisma.marketplaceListing.update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json(listing);
}
