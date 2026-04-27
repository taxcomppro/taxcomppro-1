import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSettings() {
  let s = await prisma.atlasSettings.findFirst();
  if (!s) {
    s = await prisma.atlasSettings.create({
      data: { updatedAt: new Date() },
    });
  }
  return s;
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(await getSettings());
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const s = await getSettings();
  const updated = await prisma.atlasSettings.update({
    where: { id: s.id },
    data: {
      widgetEnabled:    body.widgetEnabled    ?? s.widgetEnabled,
      defaultProvider:  body.defaultProvider  ?? s.defaultProvider,
      allowedTiers:     body.allowedTiers     ?? s.allowedTiers,
      maxTokens:        body.maxTokens        ?? s.maxTokens,
      systemPromptExtra:body.systemPromptExtra?? s.systemPromptExtra,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(updated);
}
