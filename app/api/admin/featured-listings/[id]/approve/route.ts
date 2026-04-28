import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const req = await prisma.featuredListingRequest.findUnique({ where: { id } });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + req.durationMonths);

  await prisma.$transaction([
    prisma.featuredListingRequest.update({
      where: { id },
      data: { status: "ACTIVE", startsAt: now, endsAt },
    }),
    prisma.marketplaceListing.update({
      where: { id: req.listingId },
      data: { isFeatured: true },
    }),
    prisma.notification.create({
      data: {
        userId: req.userId,
        type: "SYSTEM",
        title: "Featured Listing Approved! 🌟",
        message: `Your listing has been approved and is now featured on the marketplace until ${endsAt.toLocaleDateString()}.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
