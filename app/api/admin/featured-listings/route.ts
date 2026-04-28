import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING_APPROVAL";

  const requests = await prisma.featuredListingRequest.findMany({
    where: { status: status as never },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      listing: { select: { id: true, title: true, category: true, images: true, description: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
