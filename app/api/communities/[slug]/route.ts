import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: req.headers });

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count:  { select: { members: true, posts: true } },
      members: {
        take: 8, orderBy: { joinedAt: "asc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });
  if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember = session
    ? !!(await prisma.communityMember.findUnique({
        where: { userId_communityId: { userId: session.user.id, communityId: community.id } },
      }))
    : false;

  return NextResponse.json({ ...community, isMember });
}
