"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Settings01Icon, Tick02Icon, ToggleOnIcon, ToggleOffIcon,
  AiMagicIcon, InformationCircleIcon,
} from "hugeicons-react";

interface AtlasSettings {
  id: string;
  widgetEnabled: boolean;
  defaultProvider: string;
  allowedTiers: string[];
  maxTokens: number;
  systemPromptExtra: string;
}

const ALL_TIERS = ["FREE", "VIP", "MARKETPLACE", "MARKETPLACE_PLUS"];
const TIER_LABELS: Record<string, string> = {
  FREE: "Free Members",
  VIP: "VIP Members",
  MARKETPLACE: "Marketplace",
  MARKETPLACE_PLUS: "Marketplace Plus",
};

export default function AdminAtlasPage() {
  const [settings, setSettings] = useState<AtlasSettings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    fetch("/api/admin/atlas-settings")
      .then(r => r.json())
      .then(d => setSettings(d))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const r = await fetch("/api/admin/atlas-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const toggleTier = (tier: string) => {
    if (!settings) return;
    setSettings(s => s ? {
      ...s,
      allowedTiers: s.allowedTiers.includes(tier)
        ? s.allowedTiers.filter(t => t !== tier)
        : [...s.allowedTiers, tier],
    } : s);
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" />
    </div>
  );

  if (!settings) return (
    <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
      Failed to load settings.
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0a1628] flex items-center gap-2">
          <AiMagicIcon className="w-6 h-6 text-[#d4a017]" />
          Atlas AI Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Control the Atlas AI chat widget for all users.</p>
      </div>

      {/* Widget Enable/Disable */}
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <h2 className="font-black text-[#0a1628] flex items-center gap-2 text-sm">
          <Settings01Icon className="w-4 h-4" /> General
        </h2>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div>
            <div className="font-bold text-[#0a1628] text-sm">Widget Enabled</div>
            <div className="text-xs text-slate-400">Show or hide the Atlas AI chat bubble for all users</div>
          </div>
          <button onClick={() => setSettings(s => s ? { ...s, widgetEnabled: !s.widgetEnabled } : s)}>
            {settings.widgetEnabled
              ? <ToggleOnIcon className="w-9 h-9 text-emerald-500" />
              : <ToggleOffIcon className="w-9 h-9 text-slate-300" />}
          </button>
        </div>

        {/* Default Provider */}
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="font-bold text-[#0a1628] text-sm mb-2">Default AI Provider</div>
          <div className="flex gap-2">
            {[
              { value: "openai",  label: "GPT-4o",  color: "bg-blue-600" },
              { value: "claude",  label: "Claude",   color: "bg-violet-600" },
            ].map(p => (
              <button key={p.value} onClick={() => setSettings(s => s ? { ...s, defaultProvider: p.value } : s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  settings.defaultProvider === p.value
                    ? `${p.color} text-white shadow-sm`
                    : "bg-white text-slate-500 border border-slate-200"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Tokens */}
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-[#0a1628] text-sm">Max Response Tokens</div>
            <span className="text-sm font-black text-[#d4a017]">{settings.maxTokens}</span>
          </div>
          <input type="range" min={256} max={4096} step={128}
            value={settings.maxTokens}
            onChange={e => setSettings(s => s ? { ...s, maxTokens: parseInt(e.target.value) } : s)}
            className="w-full accent-[#d4a017]" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>256 (Fast)</span><span>4096 (Detailed)</span>
          </div>
        </div>
      </div>

      {/* Access Control */}
      <div className="bg-white rounded-2xl p-5 space-y-4">
        <h2 className="font-black text-[#0a1628] flex items-center gap-2 text-sm">
          <InformationCircleIcon className="w-4 h-4" /> Access Control
        </h2>
        <p className="text-xs text-slate-400">Choose which membership tiers can use the Atlas AI widget.</p>
        <div className="space-y-2">
          {ALL_TIERS.map(tier => {
            const active = settings.allowedTiers.includes(tier);
            return (
              <div key={tier} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-[#0a1628] text-sm">{TIER_LABELS[tier]}</div>
                  <div className="text-xs text-slate-400">{tier} tier members</div>
                </div>
                <button onClick={() => toggleTier(tier)}>
                  {active
                    ? <ToggleOnIcon className="w-9 h-9 text-emerald-500" />
                    : <ToggleOffIcon className="w-9 h-9 text-slate-300" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom system prompt */}
      <div className="bg-white rounded-2xl p-5 space-y-3">
        <h2 className="font-black text-[#0a1628] flex items-center gap-2 text-sm">
          <AiMagicIcon className="w-4 h-4" /> Custom System Prompt Addition
        </h2>
        <p className="text-xs text-slate-400">
          Extra context appended to the Atlas AI system prompt (e.g. your firm name, focus areas).
        </p>
        <textarea
          rows={4}
          value={settings.systemPromptExtra}
          onChange={e => setSettings(s => s ? { ...s, systemPromptExtra: e.target.value } : s)}
          placeholder="e.g. This assistant is used by XYZ Tax Firm. Focus on small business tax questions."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0a1628] outline-none focus:ring-2 focus:ring-[#0a1628]/20 resize-none font-[inherit]"
        />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 disabled:opacity-60 ${
            saved ? "bg-emerald-500 text-white" : "bg-[#0a1628] text-white hover:bg-[#1a3a6b]"
          }`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Tick02Icon className="w-4 h-4" /> : null}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
