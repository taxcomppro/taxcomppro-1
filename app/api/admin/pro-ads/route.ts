import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/pro-ads?status=PENDING_APPROVAL
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status") ?? "PENDING_APPROVAL";

  const ads = await prisma.proAd.findMany({
    where: { status: status as never },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
  });

  return NextResponse.json(ads);
}
