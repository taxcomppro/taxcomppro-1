import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: new Headers(req.headers) });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await req.json() as { partnerId: string };
  if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });

  const apiKey    = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  const myId      = session.user.id;

  // Deterministic room name — same for both participants regardless of who calls first
  const roomName = `msg_${[myId, partnerId].sort().join("_")}`;

  const token = new AccessToken(apiKey, apiSecret, {
    identity: myId,
    name: session.user.name ?? myId,
  });
  token.addGrant({ roomJoin: true, room: roomName, canPublishData: true, canSubscribe: true });

  return NextResponse.json({
    token: await token.toJwt(),
    url: process.env.LIVEKIT_URL,
    room: roomName,
  });
}
