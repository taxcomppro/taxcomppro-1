import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" ? user : null;
}

async function getOrCreateSettings() {
  let s = await prisma.affiliateSettings.findFirst();
  if (!s) s = await prisma.affiliateSettings.create({ data: { updatedAt: new Date() } });
  return s;
}

// GET — affiliate program settings
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings);
}

// PATCH — update affiliate settings
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const settings = await getOrCreateSettings();

  const updated = await prisma.affiliateSettings.update({
    where: { id: settings.id },
    data: {
      commissionVip:         body.commissionVip         ?? settings.commissionVip,
      commissionMarketplace: body.commissionMarketplace ?? settings.commissionMarketplace,
      commissionPlus:        body.commissionPlus        ?? settings.commissionPlus,
      minPayoutAmount:       body.minPayoutAmount       ?? settings.minPayoutAmount,
      cookieDays:            body.cookieDays            ?? settings.cookieDays,
      programEnabled:        body.programEnabled        ?? settings.programEnabled,
      updatedAt:             new Date(),
    },
  });

  return NextResponse.json(updated);
}
