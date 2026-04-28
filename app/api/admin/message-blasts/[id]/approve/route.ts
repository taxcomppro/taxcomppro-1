import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/message-blasts/[id]/approve
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const blast = await prisma.messageBlast.findUnique({
    where: { id },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });
  if (!blast) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (blast.status !== "PENDING_APPROVAL")
    return NextResponse.json({ error: "Blast is not pending approval" }, { status: 400 });

  // Build audience query
  const where: Record<string, unknown> = { id: { not: blast.senderId } };
  if (blast.filterRoles.length)  where.role = { in: blast.filterRoles };
  if (blast.filterCities.length || blast.filterStates.length) {
    where.OR = [
      ...blast.filterCities.map(c => ({ location: { contains: c, mode: "insensitive" as const } })),
      ...blast.filterStates.map(s => ({ location: { contains: s, mode: "insensitive" as const } })),
    ];
  }

  const recipients = await prisma.user.findMany({
    where,
    select: { id: true },
  });

  // Bulk-create sponsored messages
  await prisma.message.createMany({
    data: recipients.map(r => ({
      senderId:    blast.senderId,
      receiverId:  r.id,
      content:     `**${blast.subject}**\n\n${blast.content}`,
      isSponsored: true,
      blastId:     blast.id,
    })),
    skipDuplicates: true,
  });

  // Mark blast delivered
  await prisma.messageBlast.update({
    where: { id },
    data: { status: "DELIVERED", deliveredAt: new Date() },
  });

  // Notify sender
  await prisma.notification.create({
    data: {
      userId:  blast.senderId,
      type:    "BLAST_DELIVERED",
      title:   "Message Blast Delivered!",
      message: `Your blast "${blast.subject}" was sent to ${recipients.length.toLocaleString()} members.`,
      link:    "/pro-marketing",
    },
  });

  return NextResponse.json({ ok: true, delivered: recipients.length });
}
