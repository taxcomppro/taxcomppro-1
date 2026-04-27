import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: { receiverId: session.user.id, isRead: false },
  });

  return NextResponse.json({ count });
}
