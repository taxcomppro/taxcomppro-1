"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap, Plus, Loader2, Users, BookOpen,
  Eye, EyeOff, Archive, CheckCircle2, Clock, Trash2,
} from "lucide-react";

interface AdminCourse {
  id: string; slug: string; title: string; category: string;
  level: string; status: string; isFree: boolean; price: number;
  createdAt: string;
  instructor: { name: string; email: string };
  _count: { enrollments: number; sections: number };
}

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  DRAFT:     { label: "Draft",     cls: "bg-slate-100 text-slate-500",    icon: Clock },
  PUBLISHED: { label: "Published", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  ARCHIVED:  { label: "Archived",  cls: "bg-red-100 text-red-600",         icon: Archive },
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/courses")
      .then(r => r.ok ? r.json() : [])
      .then(d => setCourses(Array.isArray(d) ? d : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setActing(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } finally { setActing(p => ({ ...p, [id]: false })); }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course? All enrollments will be lost.")) return;
    setActing(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (res.ok) setCourses(prev => prev.filter(c => c.id !== id));
    } finally { setActing(p => ({ ...p, [id]: false })); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0a1628]">Course Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create and manage all platform courses</p>
        </div>
        <Link href="/admin/courses/create"
          className="flex items-center gap-2 bg-gradient-to-r from-[#f0c040] to-[#d4a017] text-[#0a1628] font-bold px-5 py-2.5 rounded-xl hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",     value: courses.length,                                               icon: GraduationCap, color: "text-[#d4a017]" },
          { label: "Published", value: courses.filter(c => c.status === "PUBLISHED").length,         icon: CheckCircle2,  color: "text-emerald-500" },
          { label: "Enrolled",  value: courses.reduce((s, c) => s + c._count.enrollments, 0),       icon: Users,         color: "text-blue-500" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#0a1628]">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Course</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider hidden md:table-cell">Stats</th>
                <th className="text-left text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Status</th>
                <th className="text-right text-xs font-bold text-slate-500 px-5 py-3.5 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map(c => {
                const sc = STATUS_CFG[c.status] ?? STATUS_CFG.DRAFT;
                const SI = sc.icon;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#0a1628] text-sm">{c.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.category} · {c.level.charAt(0) + c.level.slice(1).toLowerCase()}</div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c._count.enrollments}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c._count.sections} sections</span>
                        <span className="font-bold text-[#0a1628]">{c.isFree ? "Free" : `$${c.price}`}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.cls}`}>
                        <SI className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {acting[c.id] ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : (
                          <>
                            <Link href={`/admin/courses/edit/${c.id}`}
                              className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all">
                              Edit
                            </Link>
                            {c.status !== "PUBLISHED" && (
                              <button onClick={() => updateStatus(c.id, "PUBLISHED")}
                                className="flex items-center gap-1 text-xs font-bold bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-all">
                                <Eye className="w-3 h-3" /> Publish
                              </button>
                            )}
                            {c.status === "PUBLISHED" && (
                              <button onClick={() => updateStatus(c.id, "ARCHIVED")}
                                className="flex items-center gap-1 text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-all">
                                <EyeOff className="w-3 h-3" /> Archive
                              </button>
                            )}
                            <button onClick={() => deleteCourse(c.id)}
                              className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {courses.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <GraduationCap className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No courses yet</p>
              <Link href="/admin/courses/create" className="mt-2 inline-block text-sm text-[#d4a017] font-bold hover:underline">
                Create your first course →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
