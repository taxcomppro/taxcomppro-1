"use client";

import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MemberProfile = dynamic(() => import("@/components/profile/MemberProfile"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#0a1628]" /></div>,
});

const ProProfile = dynamic(() => import("@/components/profile/ProProfileEditor"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#0a1628]" /></div>,
});

export default function ProfilePage() {
  const user = useAppSelector(s => s.auth.user);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-[#0a1628]" />
    </div>
  );

  if (user.role === "PROFESSIONAL" || user.role === "ADMIN") {
    return <ProProfile />;
  }

  return <MemberProfile />;
}
