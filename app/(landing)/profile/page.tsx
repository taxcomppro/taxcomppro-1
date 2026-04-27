"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/schemas";
import Link from "next/link";
import {
  UserCircleIcon, Mail01Icon, Briefcase01Icon, NoteIcon,
  Tick02Icon, BookOpen01Icon, ShoppingBag01Icon, UserGroupIcon,
  Rocket01Icon, CrownIcon, Edit01Icon,
} from "hugeicons-react";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", bio: user?.bio ?? "", headline: user?.headline ?? "" },
  });

  // keep form in sync if user changes in store
  useEffect(() => {
    reset({ name: user?.name ?? "", bio: user?.bio ?? "", headline: user?.headline ?? "" });
  }, [user, reset]);

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok && user) {
        dispatch(setUser({ ...user, name: data.name, bio: data.bio ?? "", headline: data.headline ?? "" }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        reset(data);
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const tierLabels: Record<string, string> = {
    FREE: "Free Member", VIP: "VIP Member",
    MARKETPLACE: "Marketplace", MARKETPLACE_PLUS: "Marketplace Plus",
  };
  const tierColors: Record<string, string> = {
    FREE: "bg-slate-100 text-slate-600",
    VIP: "bg-amber-100 text-amber-700",
    MARKETPLACE: "bg-indigo-100 text-indigo-700",
    MARKETPLACE_PLUS: "bg-emerald-100 text-emerald-700",
  };
  const roleLabels: Record<string, string> = {
    MEMBER: "Member", PROFESSIONAL: "Professional", ADMIN: "Administrator",
  };

  const tier = user?.tier ?? "FREE";
  const canSell = tier === "MARKETPLACE" || tier === "MARKETPLACE_PLUS" || user?.role === "PROFESSIONAL";

  const quickLinks = [
    { icon: BookOpen01Icon,   label: "My Courses",    href: "/my-courses",   color: "text-indigo-500 bg-indigo-50" },
    { icon: UserGroupIcon,    label: "Connections",   href: "/connections",  color: "text-emerald-500 bg-emerald-50" },
    { icon: ShoppingBag01Icon,label: "Marketplace",   href: "/marketplace",  color: "text-amber-500 bg-amber-50" },
    ...(!canSell ? [{ icon: Rocket01Icon, label: "Upgrade Plan", href: "/upgrade", color: "text-purple-500 bg-purple-50" }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 pb-12">

      {/* Hero banner */}
      <div className="h-40 bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#0d2a50] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-100 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16">

        {/* Profile header card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-visible relative mb-5">
          <div className="flex flex-col sm:flex-row items-start gap-5 p-6 pt-4">
            {/* Avatar */}
            <div className="relative shrink-0 -mt-10">
              <div className="w-24 h-24 rounded-full bg-[#0a1628] border-4 border-white overflow-hidden flex items-center justify-center shadow-lg">
                {user?.image
                  ? <img src={user.image} alt={user.name ?? ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  : <span className="text-white font-black text-4xl">{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              {/* online dot */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            {/* Name / headline / badges */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-[#0a1628] leading-none">{user?.name}</h1>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tierColors[tier]}`}>
                  {tierLabels[tier]}
                </span>
                {user?.role !== "MEMBER" && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0a1628]/10 text-[#0a1628] flex items-center gap-1">
                    <CrownIcon className="w-3 h-3" />{roleLabels[user?.role ?? "MEMBER"]}
                  </span>
                )}
              </div>

              {user?.headline
                ? <p className="text-sm font-semibold text-slate-600 mb-1">{user.headline}</p>
                : <p className="text-sm text-slate-400 italic mb-1">No headline yet — add one below</p>}

              {user?.bio
                ? <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{user.bio}</p>
                : <p className="text-sm text-slate-400 italic">No bio yet — tell the community about yourself</p>}

              <p className="text-xs text-slate-400 mt-2">{user?.email}</p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 shrink-0 mt-1">
              <Link href="/connections"
                className="flex items-center gap-1.5 text-xs font-bold border border-[#0a1628] text-[#0a1628] px-4 py-2 rounded-full hover:bg-[#0a1628] hover:text-white transition-all">
                <UserGroupIcon className="w-3.5 h-3.5" /> Connections
              </Link>
              <Link href="/feed"
                className="flex items-center gap-1.5 text-xs font-bold bg-[#0a1628] text-white px-4 py-2 rounded-full hover:bg-[#1a3a6b] transition-all">
                View Feed
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left col — quick links + stats */}
          <div className="space-y-4">

            {/* Quick links */}
            <div className="bg-white rounded-2xl p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Quick Links</h3>
              <div className="space-y-1">
                {quickLinks.map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0a1628] transition-all group">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.color}`}>
                      <l.icon className="w-4 h-4" />
                    </span>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Upgrade banner for free users */}
            {!canSell && (
              <div className="bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket01Icon className="w-4 h-4 text-[#f0c040]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#f0c040]">Go Pro</span>
                </div>
                <p className="text-sm font-bold leading-snug mb-3">Unlock marketplace selling, premium courses & more</p>
                <Link href="/upgrade"
                  className="block text-center text-xs font-bold bg-[#f0c040] text-[#0a1628] rounded-lg py-2 hover:bg-[#d4a017] transition-all">
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>

          {/* Right col — edit form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Edit01Icon className="w-4 h-4 text-[#0a1628]" />
                <h2 className="font-black text-[#0a1628] text-base">Edit Profile</h2>
              </div>

              {/* Success banner */}
              {saved && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-5">
                  <Tick02Icon className="w-4 h-4 shrink-0" /> Profile saved successfully!
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Your full name"
                      className={`w-full font-[inherit] text-sm pl-10 pr-4 py-3 border rounded-xl outline-none transition-all ${errors.name ? "border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10"}`}
                      {...register("name")} />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Email (locked) */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type="email" value={user?.email ?? ""} disabled
                      className="w-full font-[inherit] text-sm pl-10 pr-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Email address cannot be changed</p>
                </div>

                {/* Headline */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Professional Headline</label>
                  <div className="relative">
                    <Briefcase01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="e.g. CPA | Tax Attorney | Enrolled Agent"
                      className="w-full font-[inherit] text-sm pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all"
                      maxLength={100}
                      {...register("headline")} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Shown under your name throughout the platform</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Bio</label>
                  <div className="relative">
                    <NoteIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <textarea placeholder="Tell the community about yourself, your expertise, and what you're working on…" rows={5}
                      className="w-full font-[inherit] text-sm pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all resize-none"
                      maxLength={500}
                      {...register("bio")} />
                  </div>
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                </div>

                {/* Save button */}
                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" disabled={saving || !isDirty}
                    className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-7 py-3 rounded-full hover:bg-[#1a3a6b] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    {saving
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      : <><Tick02Icon className="w-4 h-4" /> Save Changes</>}
                  </button>
                  {saved && (
                    <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                      <Tick02Icon className="w-4 h-4" /> Saved!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
