import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { reason } = await req.json().catch(() => ({ reason: "" }));

  const request = await prisma.featuredListingRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.featuredListingRequest.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason ?? null },
    }),
    prisma.notification.create({
      data: {
        userId: request.userId,
        type: "SYSTEM",
        title: "Featured Listing Request Rejected",
        message: reason ? `Your featured listing request was rejected: ${reason}` : "Your featured listing request was rejected by an admin.",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
