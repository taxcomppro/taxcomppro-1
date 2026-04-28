import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.marketplaceListing.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, category: true, images: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}
