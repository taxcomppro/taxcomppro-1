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

  // Fetch all toolkit assets once (from DB, not env vars)
  const assets    = await prisma.toolkitAsset.findMany();
  const assetMap  = Object.fromEntries(assets.map(a => [a.toolkitId, a.fileUrl]));

  const enriched = purchases.map(p => {
    const toolkit = getToolkit(p.toolkitId);
    // Use our proxy endpoint — never expose raw Cloudinary URL to client
    const downloadUrl = assetMap[p.toolkitId]
      ? `/api/download/toolkit/${p.toolkitId}`
      : null;
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
