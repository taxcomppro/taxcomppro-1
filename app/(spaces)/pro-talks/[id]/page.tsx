"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SpaceRoom from "@/components/spaces/SpaceRoom";

interface SpaceHost { id: string; name: string; image: string | null; headline: string | null; }
interface Space { id: string; name: string; description: string | null; roomName: string; isLive: boolean; createdAt: string; host: SpaceHost; hostId: string; }

export default function ProTalkPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [space,   setSpace]   = useState<Space | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId,  setUserId]  = useState("");
  const [ending,  setEnding]  = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/spaces/${id}`).then(r => r.json()),
      fetch(`/api/spaces/${id}/token`, { method: "POST" }).then(r => r.json()),
      fetch("/api/user/me").then(r => r.json()),
    ]).then(([spaceData, tokenData, me]) => {
      if (spaceData.error) { setError(spaceData.error); return; }
      if (tokenData.error) { setError(tokenData.error); return; }
      setSpace(spaceData as Space);
      setToken(tokenData.token as string);
      if (me?.id) { setUserId(me.id); setIsAdmin(me.role === "ADMIN"); }
    }).catch(() => setError("Failed to join Pro Talk"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnd = async () => {
    if (ending) return;
    setEnding(true);
    await fetch(`/api/spaces/${id}`, { method: "DELETE" });
    router.push("/pro-talks");
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 bg-[#06091a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        <p className="text-white/40 text-sm">Joining Pro Talk…</p>
      </div>
    </div>
  );

  if (error || !space || !token) return (
    <div className="fixed inset-0 z-50 bg-[#06091a] flex flex-col items-center justify-center gap-5">
      <p className="text-white/50 text-lg">{error ?? "Pro Talk unavailable"}</p>
      <button onClick={() => router.push("/pro-talks")} className="px-6 py-2.5 rounded-full bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-all">Back to Pro Talks</button>
    </div>
  );

  return <SpaceRoom space={space} token={token} isAdmin={isAdmin} userId={userId} onEnd={handleEnd} ending={ending} />;
}
