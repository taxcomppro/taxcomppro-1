import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllToolkits } from "@/lib/toolkits";

// GET — list all toolkits with their current asset (download URL)
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const toolkits = getAllToolkits();
  const assets   = await prisma.toolkitAsset.findMany();
  const assetMap = Object.fromEntries(assets.map(a => [a.toolkitId, a]));

  return NextResponse.json(
    toolkits.map(tk => ({
      toolkitId:  tk.id,
      name:       tk.name,
      emoji:      tk.emoji,
      price:      tk.price,
      asset:      assetMap[tk.id] ?? null,
    }))
  );
}

// POST — upsert a toolkit's download URL (called after Cloudinary upload)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { toolkitId, fileUrl, fileName, fileSize } =
    await req.json() as { toolkitId: string; fileUrl: string; fileName: string; fileSize?: number };

  if (!toolkitId || !fileUrl || !fileName)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const asset = await prisma.toolkitAsset.upsert({
    where:  { toolkitId },
    create: { toolkitId, fileUrl, fileName, fileSize },
    update: { fileUrl, fileName, fileSize, updatedAt: new Date() },
  });

  return NextResponse.json(asset);
}

// DELETE — remove a toolkit's download asset
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string };
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { toolkitId } = await req.json() as { toolkitId: string };
  await prisma.toolkitAsset.deleteMany({ where: { toolkitId } });
  return NextResponse.json({ success: true });
}
