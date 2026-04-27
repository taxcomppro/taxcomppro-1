"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";

interface Service { id: string; title: string; description: string | null; price: string | null; emoji: string; }

const EMOJIS = ["⭐","💼","📊","🧾","🏛️","📋","🔍","💡","🎯","🤝","📈","🛡️"];

export default function ServiceEditor({ proId, initial }: { proId: string; initial: Service[] }) {
  const [services, setServices] = useState<Service[]>(initial);
  const [adding,   setAdding]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", description: "", price: "", emoji: "⭐" });

  const reset = () => { setForm({ title: "", description: "", price: "", emoji: "⭐" }); setAdding(false); setEditId(null); };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editId) {
      const res = await fetch(`/api/pros/${proId}/services/${editId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json() as Service;
        setServices(s => s.map(x => x.id === editId ? updated : x));
      }
    } else {
      const res = await fetch(`/api/pros/${proId}/services`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json() as Service;
        setServices(s => [...s, created]);
      }
    }
    setSaving(false);
    reset();
  };

  const remove = async (id: string) => {
    await fetch(`/api/pros/${proId}/services/${id}`, { method: "DELETE" });
    setServices(s => s.filter(x => x.id !== id));
  };

  const startEdit = (svc: Service) => {
    setForm({ title: svc.title, description: svc.description ?? "", price: svc.price ?? "", emoji: svc.emoji });
    setEditId(svc.id);
    setAdding(true);
  };

  const inp = "w-full font-[inherit] text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/10 transition-all";

  return (
    <div className="space-y-3">
      {services.map(svc => (
        <div key={svc.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-all">
          <span className="text-2xl mt-0.5">{svc.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#0a1628] text-sm">{svc.title}</p>
            {svc.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{svc.description}</p>}
            {svc.price && <p className="text-xs font-bold text-emerald-600 mt-1">{svc.price}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => startEdit(svc)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-all text-slate-500 hover:text-[#0a1628]"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => remove(svc.id)} className="p-1.5 hover:bg-red-100 rounded-lg transition-all text-slate-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="p-4 rounded-xl border-2 border-[#0a1628]/20 bg-slate-50 space-y-3">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className={`text-lg w-9 h-9 rounded-lg flex items-center justify-center transition-all ${form.emoji === e ? "bg-[#0a1628] shadow-md" : "bg-white border border-slate-200 hover:border-slate-400"}`}>
                {e}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Service title *" className={inp} />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Short description (optional)" rows={2} className={`${inp} resize-none`} />
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price e.g. $150/hr, $99/session, Contact for pricing" className={inp} />
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || !form.title.trim()}
              className="flex items-center gap-1.5 bg-[#0a1628] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#1a3a6b] transition-all disabled:opacity-40">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editId ? "Update" : "Add"} Service
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 px-3 py-2 rounded-xl hover:bg-slate-200 transition-all">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0a1628] text-slate-400 hover:text-[#0a1628] text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" /> Add a Service
        </button>
      )}
    </div>
  );
}
