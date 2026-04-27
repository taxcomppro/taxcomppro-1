import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: messages between current user and [userId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: partnerId } = await params;
  const myId = session.user.id;

  // Mark messages from partner as read
  await prisma.message.updateMany({
    where: { senderId: partnerId, receiverId: myId, isRead: false },
    data:  { isRead: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const partner = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, image: true, headline: true, role: true },
  });

  return NextResponse.json({ messages, partner });
}

// POST: send message to [userId]
export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: receiverId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  // Must be connected to message
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, receiverId, status: "ACCEPTED" },
        { requesterId: receiverId, receiverId: session.user.id, status: "ACCEPTED" },
      ],
    },
  });
  if (!connection) return NextResponse.json({ error: "You must be connected to send messages" }, { status: 403 });

  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId, content: content.trim() },
  });

  return NextResponse.json(message, { status: 201 });
}
