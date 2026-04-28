import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BLAST_LIMIT_PER_MONTH } from "@/lib/blast-pricing";

// GET /api/message-blast/my — sender's blast history + quota info
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blastMonth = new Date().toISOString().slice(0, 7);

  const [blasts, usedThisMonth] = await Promise.all([
    prisma.messageBlast.findMany({
      where: { senderId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.messageBlast.count({
      where: {
        senderId: session.user.id,
        blastMonth,
        status: { notIn: ["REJECTED"] },
      },
    }),
  ]);

  return NextResponse.json({
    blasts,
    quota: { used: usedThisMonth, limit: BLAST_LIMIT_PER_MONTH, remaining: Math.max(0, BLAST_LIMIT_PER_MONTH - usedThisMonth) },
  });
}
