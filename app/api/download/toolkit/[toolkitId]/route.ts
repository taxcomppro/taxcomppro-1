import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ toolkitId: string }> }
) {
  const { toolkitId } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUser = session.user as { id: string; role?: string };

  if (sessionUser.role !== "ADMIN") {
    const purchase = await prisma.toolkitPurchase.findFirst({
      where: { userId: sessionUser.id, toolkitId },
    });
    if (!purchase) return NextResponse.json({ error: "Not purchased" }, { status: 403 });
  }

  const asset = await prisma.toolkitAsset.findUnique({ where: { toolkitId } });
  if (!asset) return NextResponse.json({ error: "File not available" }, { status: 404 });

  // Fetch file server-side and stream with correct headers
  const upstream = await fetch(asset.fileUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${asset.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
