import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public endpoint — widget uses this to check if it should render */
export async function GET() {
  try {
    let s = await prisma.atlasSettings.findFirst();
    if (!s) {
      s = await prisma.atlasSettings.create({ data: { updatedAt: new Date() } });
    }
    return NextResponse.json({
      widgetEnabled:   s.widgetEnabled,
      defaultProvider: s.defaultProvider,
      allowedTiers:    s.allowedTiers,
    });
  } catch {
    // Fail open so the widget still shows if DB is unavailable
    return NextResponse.json({ widgetEnabled: true, defaultProvider: "openai", allowedTiers: [] });
  }
}
