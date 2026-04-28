import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.featuredListingRequest.findMany({
    where: { userId: session.user.id },
    include: { listing: { select: { id: true, title: true, category: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
