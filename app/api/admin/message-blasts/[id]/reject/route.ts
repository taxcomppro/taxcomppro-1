import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/message-blasts/[id]/reject  { reason? }
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { reason } = await req.json().catch(() => ({ reason: "" })) as { reason?: string };

  const blast = await prisma.messageBlast.findUnique({ where: { id } });
  if (!blast) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.messageBlast.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason?.trim() ?? null },
  });

  // Notify sender
  await prisma.notification.create({
    data: {
      userId:  blast.senderId,
      type:    "BLAST_REJECTED",
      title:   "Message Blast Rejected",
      message: reason?.trim()
        ? `Your blast "${blast.subject}" was rejected: ${reason.trim()}`
        : `Your blast "${blast.subject}" was rejected by an admin.`,
      link: "/pro-marketing",
    },
  });

  return NextResponse.json({ ok: true });
}
