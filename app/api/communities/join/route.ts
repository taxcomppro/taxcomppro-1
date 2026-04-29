import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/communities/join  — join a community
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { communityId } = await req.json();
  if (!communityId) return NextResponse.json({ error: "communityId required" }, { status: 400 });

  // Check community exists
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

  // Check already a member
  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: session.user.id, communityId } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const member = await prisma.communityMember.create({
    data: { userId: session.user.id, communityId, role: "MEMBER" },
  });

  // Increment member count
  await prisma.community.update({
    where: { id: communityId },
    data: { memberCount: { increment: 1 } },
  });

  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/communities/join  — leave a community
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { communityId } = await req.json();

  await prisma.communityMember.delete({
    where: { userId_communityId: { userId: session.user.id, communityId } },
  });

  await prisma.community.update({
    where: { id: communityId },
    data: { memberCount: { decrement: 1 } },
  });

  return NextResponse.json({ ok: true });
}
