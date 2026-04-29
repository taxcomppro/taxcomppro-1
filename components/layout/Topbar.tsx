"use client";

import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { markAllRead } from "@/store/slices/notificationSlice";
import { signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, UserCircle, ArrowUpCircle, ChevronDown, Gift } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/feed":                   "Feed",
  "/dashboard":              "Dashboard",
  "/marketplace":            "Marketplace",
  "/marketplace/create":     "Create Listing",
  "/communities":            "Communities",
  "/notifications":          "Notifications",
  "/profile":                "My Profile",
  "/upgrade":                "Upgrade Plan",
  "/courses":                "Courses",
  "/my-courses":             "My Courses",
  "/admin":                  "Admin Dashboard",
  "/admin/users":            "User Management",
  "/admin/approvals":        "Listing Approvals",
  "/admin/analytics":        "Analytics",
  "/admin/settings":         "Settings",
  "/admin/courses":          "Course Management",
  "/admin/courses/create":   "Create Course",
};

export default function Topbar() {
  const user     = useAppSelector((s) => s.auth.user);
  const unread   = useAppSelector((s) => s.notifications.unreadCount);
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[pathname] ?? "";

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <header className="h-16 flex items-center justify-between px-7 border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-bold text-[#0a1628]">{title}</h1>}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Notifications bell */}
        <Link href="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-500"
          title="Notifications"
          onClick={() => dispatch(markAllRead())}>
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* User dropdown — click-based */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
            <div className="w-7 h-7 rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden shrink-0">
              {user?.image
                ? <img src={user.image} alt={user?.name ?? ""} className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <span className="text-sm font-semibold text-[#0a1628] max-w-[100px] truncate hidden sm:block">
              {user?.name?.split(" ")[0]}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-slate-200 rounded-2xl shadow-xl min-w-[210px] p-2 z-50">
              {/* User info */}
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <div className="font-bold text-[#0a1628] text-sm truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>

              <Link href="/profile" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 text-sm font-medium text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                <UserCircle className="w-4 h-4 text-slate-400" /> Profile
              </Link>
              <Link href="/affiliate" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 text-sm font-medium text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                <Gift className="w-4 h-4 text-slate-400" /> Affiliate Program
              </Link>
              <Link href="/upgrade" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 text-sm font-medium text-slate-700 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                <ArrowUpCircle className="w-4 h-4 text-slate-400" /> Upgrade Plan
              </Link>
              <div className="h-px bg-slate-100 my-1" />
              <button onClick={handleSignOut}
                className="flex items-center gap-2.5 text-sm font-medium text-red-500 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all w-full text-left">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
