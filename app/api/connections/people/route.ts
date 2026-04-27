import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list people to discover (not yet connected, not self)
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const search = new URL(req.url).searchParams.get("search") ?? "";

  // Get IDs of people already in a connection with me (any status)
  const existing = await prisma.connection.findMany({
    where: { OR: [{ requesterId: userId }, { receiverId: userId }] },
    select: { requesterId: true, receiverId: true },
  });
  const excludeIds = new Set<string>([userId]);
  existing.forEach(c => { excludeIds.add(c.requesterId); excludeIds.add(c.receiverId); });

  const people = await prisma.user.findMany({
    where: {
      id:   { notIn: Array.from(excludeIds) },
      ...(search ? { OR: [
        { name:     { contains: search, mode: "insensitive" } },
        { headline: { contains: search, mode: "insensitive" } },
      ]} : {}),
    },
    select: { id: true, name: true, image: true, headline: true, role: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(people);
}
