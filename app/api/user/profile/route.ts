import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, headline } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name     ? { name }     : {}),
      ...(bio      !== undefined ? { bio }      : {}),
      ...(headline !== undefined ? { headline } : {}),
    },
    select: { id: true, name: true, bio: true, headline: true },
  });

  return NextResponse.json(updated);
}
