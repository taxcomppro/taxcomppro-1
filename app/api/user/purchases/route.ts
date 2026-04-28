import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToolkit } from "@/lib/toolkits";

// GET /api/user/purchases — list toolkit purchases with download URLs
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const purchases = await prisma.toolkitPurchase.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Attach toolkit metadata + download URL (resolved server-side from env)
  const enriched = purchases.map(p => {
    const toolkit = getToolkit(p.toolkitId);
    const downloadUrl = process.env[toolkit?.downloadEnvKey ?? ""] ?? null;
    return {
      id:               p.id,
      toolkitId:        p.toolkitId,
      name:             toolkit?.name ?? p.toolkitId,
      emoji:            toolkit?.emoji ?? "📦",
      membershipTier:   p.membershipTier,
      membershipMonths: p.membershipMonths,
      createdAt:        p.createdAt,
      downloadUrl,
    };
  });

  return NextResponse.json(enriched);
}
