"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Shield, Briefcase, Crown, Check, Loader2 } from "lucide-react";

type Role = "MEMBER" | "PROFESSIONAL" | "ADMIN";
type Tier = "FREE" | "VIP" | "MARKETPLACE" | "MARKETPLACE_PLUS";

interface User {
  id: string; name: string; email: string;
  role: Role; tier: Tier; image: string | null; createdAt: string;
}

const roleConfig: Record<Role, { label: string; className: string; icon: React.ElementType }> = {
  MEMBER:       { label: "Member",       className: "bg-slate-100 text-slate-600",    icon: Shield },
  PROFESSIONAL: { label: "Professional", className: "bg-blue-100 text-blue-700",      icon: Briefcase },
  ADMIN:        { label: "Admin",        className: "bg-[#d4a017]/15 text-[#a07810]", icon: Crown },
};

const tierConfig: Record<Tier, { label: string; className: string }> = {
  FREE:             { label: "Free",        className: "bg-slate-100 text-slate-500" },
  VIP:              { label: "VIP",         className: "bg-amber-100 text-amber-700" },
  MARKETPLACE:      { label: "Marketplace", className: "bg-indigo-100 text-indigo-700" },
  MARKETPLACE_PLUS: { label: "Plus",        className: "bg-emerald-100 text-emerald-700" },
};

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString();
}

/** Dropdown rendered into document.body via portal — escapes any overflow:hidden container */
function RoleDropdown({
  userId, currentRole, anchor, onClose, onSelect,
}: {
  userId: string;
  currentRole: Role;
  anchor: DOMRect;
  onClose: () => void;
  onSelect: (role: Role) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: "fixed",
    top: anchor.bottom + 6,
    right: window.innerWidth - anchor.right,
    zIndex: 9999,
    minWidth: 170,
  };

  return createPortal(
    <div ref={ref} style={style}
      className="bg-white border border-slate-200 rounded-xl shadow-2xl p-1.5">
      {(["MEMBER", "PROFESSIONAL", "ADMIN"] as Role[]).map(r => {
        const rc = roleConfig[r];
        const Icon = rc.icon;
        return (
          <button key={r} onClick={() => { onSelect(r); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-50 text-slate-600">
            <Icon className="w-4 h-4 text-slate-400" />
            {rc.label}
            {currentRole === r && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [query, setQuery]           = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [loadingId, setLoadingId]   = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<{ id: string; rect: DOMRect } | null>(null);

  useEffect(() => {
    const p = new URLSearchParams();
    if (query) p.set("search", query);
    if (roleFilter !== "ALL") p.set("role", roleFilter);
    setLoading(true);
    fetch(`/api/admin/users?${p}`)
      .then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([])).finally(() => setLoading(false));
  }, [query, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleDropdown = useCallback((userId: string, btn: HTMLButtonElement) => {
    if (openDropdown?.id === userId) { setOpenDropdown(null); return; }
    setOpenDropdown({ id: userId, rect: btn.getBoundingClientRect() });
  }, [openDropdown]);

  const changeRole = async (userId: string, newRole: Role) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch { /* ignore */ }
    finally { setLoadingId(null); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0a1628]">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">View and manage all platform members and their roles</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full font-[inherit] text-sm pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL","MEMBER","PROFESSIONAL","ADMIN"] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${roleFilter === r ? "bg-[#0a1628] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {r === "ALL" ? "All Roles" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-sm text-slate-500">
        <span><strong className="text-[#0a1628]">{users.length}</strong> users shown</span>
        <span>·</span>
        <span><strong className="text-[#0a1628]">{users.filter(u => u.role === "MEMBER").length}</strong> members</span>
        <span>·</span>
        <span><strong className="text-[#0a1628]">{users.filter(u => u.role === "PROFESSIONAL").length}</strong> professionals</span>
        <span>·</span>
        <span><strong className="text-[#0a1628]">{users.filter(u => u.role === "ADMIN").length}</strong> admins</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">User</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Role</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Tier</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Joined</th>
                <th className="text-right text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const rc = roleConfig[u.role];
                const tc = tierConfig[u.tier];
                const RoleIcon = rc.icon;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0a1628] overflow-hidden flex items-center justify-center shrink-0">
                          {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                            : <span className="text-white font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0a1628] text-sm">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${rc.className}`}>
                        <RoleIcon className="w-3 h-3" />{rc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tc.className}`}>{tc.label}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{timeAgo(u.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={e => toggleDropdown(u.id, e.currentTarget)}
                        disabled={loadingId === u.id}
                        className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:border-[#0a1628] hover:text-[#0a1628] transition-all disabled:opacity-50 ml-auto">
                        {loadingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Change Role"}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-slate-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Portal dropdown — renders outside overflow:hidden container */}
      {openDropdown && (
        <RoleDropdown
          userId={openDropdown.id}
          currentRole={users.find(u => u.id === openDropdown.id)?.role ?? "MEMBER"}
          anchor={openDropdown.rect}
          onClose={() => setOpenDropdown(null)}
          onSelect={role => changeRole(openDropdown.id, role)}
        />
      )}
    </div>
  );
}
