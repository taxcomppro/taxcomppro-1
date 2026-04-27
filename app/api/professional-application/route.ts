import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — current user's own application
// If the user has an APPROVED application but is no longer PROFESSIONAL
// (e.g. admin demoted them), we reset the record so they can reapply.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, proApplication: true },
  });

  const app = user?.proApplication ?? null;

  // Stale approved record but user is no longer PROFESSIONAL → reset it
  if (app && app.status === "APPROVED" && user?.role !== "PROFESSIONAL") {
    await prisma.professionalApplication.delete({ where: { userId: session.user.id } });
    return NextResponse.json(null);
  }

  return NextResponse.json(app ?? null);
}

// POST — submit application (MEMBER only, one per user)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role === "PROFESSIONAL") return NextResponse.json({ error: "Already a professional" }, { status: 400 });
  if (user?.role === "ADMIN") return NextResponse.json({ error: "Admins cannot apply" }, { status: 400 });

  // Delete any stale/rejected application before creating a new one
  await prisma.professionalApplication.deleteMany({ where: { userId: session.user.id } });

  const { reason, specialty, credentials } = await req.json() as { reason: string; specialty: string; credentials: string };
  if (!reason?.trim() || !specialty?.trim() || !credentials?.trim())
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  const app = await prisma.professionalApplication.create({
    data: {
      userId:      session.user.id,
      reason:      reason.trim(),
      specialty:   specialty.trim(),
      credentials: credentials.trim(),
    },
  });
  return NextResponse.json(app, { status: 201 });
}
