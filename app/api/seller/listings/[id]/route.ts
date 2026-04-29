import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// DELETE /api/seller/listings/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.marketplaceListing.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
