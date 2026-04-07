"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { generateInviteCode } from "@/lib/invite-code";
import type { Couple } from "@/types";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [coupleLoading, setCoupleLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("couple_id").eq("id", user.id).single();
      if (profile?.couple_id) {
        const { data } = await supabase.from("couples").select("*").eq("id", profile.couple_id).single();
        setCouple(data);
      }
      setCoupleLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const code = generateInviteCode();
    const { data, error } = await supabase.from("couples").insert({ user1_id: user.id, invite_code: code }).select().single();
    if (!error && data) {
      await supabase.from("profiles").update({ couple_id: data.id }).eq("id", user.id);
      setCouple(data); router.refresh();
    }
    setCreating(false);
  };

  const handleJoin = async () => {
    setJoinError(null); setJoinLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: c, error } = await supabase.from("couples").select("*").eq("invite_code", joinCode.toUpperCase()).is("user2_id", null).single();
      if (error || !c) throw new Error("Invalid code");
      if (c.user1_id === user.id) throw new Error("Can't join your own");
      await supabase.from("couples").update({ user2_id: user.id, connected_at: new Date().toISOString() }).eq("id", c.id);
      await supabase.from("profiles").update({ couple_id: c.id }).eq("id", user.id);
      router.push("/calendar"); router.refresh();
    } catch (e) { setJoinError(e instanceof Error ? e.message : "Failed"); }
    finally { setJoinLoading(false); }
  };

  const handleCopy = async (code: string) => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-button text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="py-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-text-primary">Settings</h1>

      {/* Couple */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Couple</h2>
        {coupleLoading ? (
          <div className="py-6 text-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : couple ? (
          <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-4 space-y-3">
            <p className="text-sm font-semibold text-text-primary">{couple.user2_id ? "Connected" : "Waiting for partner..."}</p>
            <div className="bg-background rounded-button p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Invite Code</p>
              <p className="text-xl font-mono font-extrabold text-primary tracking-[0.15em]">{couple.invite_code}</p>
              <button onClick={() => handleCopy(couple.invite_code)}
                className="mt-2 px-4 py-1 text-xs font-semibold text-white rounded-pill"
                style={{ background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)" }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-4 space-y-3">
            <button onClick={handleCreate} disabled={creating}
              className="w-full py-3 rounded-button text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)" }}>
              {creating ? "..." : "Create Couple"}
            </button>
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-text-muted">or</span><div className="flex-1 h-px bg-border" /></div>
            {showJoin ? (
              <div className="space-y-2">
                <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={8}
                  placeholder="ABCD1234" className={`${inputClass} text-center font-mono tracking-[0.15em]`} />
                {joinError && <p className="text-xs text-accent">{joinError}</p>}
                <button onClick={handleJoin} disabled={joinLoading || joinCode.length < 8}
                  className="w-full py-3 rounded-button text-sm font-bold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #A99BF5, #7C6CF0)" }}>
                  {joinLoading ? "..." : "Join"}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowJoin(true)}
                className="w-full py-3 border border-border rounded-button text-sm font-semibold text-text-secondary hover:bg-background transition-colors">
                Join with Code
              </button>
            )}
          </div>
        )}
      </section>

      {/* Background Photo */}
      {couple && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Background Photo</h2>
          <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-4 space-y-3">
            <p className="text-sm text-text-secondary">Set a couple photo as the app background</p>
            <label className="block cursor-pointer">
              <div className="py-3 text-center text-sm font-semibold text-primary border border-dashed border-primary/30 rounded-button hover:bg-primary-pale transition-colors">
                {bgUploading ? "Uploading..." : "Choose Photo"}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !couple) return;
                setBgUploading(true);
                // Delete old background first
                await supabase.storage.from("photos").remove([`${couple.id}/background`]);
                // Upload new
                await supabase.storage.from("photos").upload(`${couple.id}/background`, file, { upsert: true });
                setBgUploading(false);
                // Refresh to show new background
                router.refresh();
                window.location.reload();
              }} />
            </label>
          </div>
        </section>
      )}

      {/* Language */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Language</h2>
        <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-1 flex gap-1">
          {(["ko", "en"] as const).map((lang) => (
            <button key={lang} onClick={() => {
              localStorage.setItem("dayswemet-locale", lang);
              window.location.reload();
            }}
              className={`flex-1 py-2 rounded-[16px] text-sm font-semibold transition-all ${
                (typeof window !== "undefined" && localStorage.getItem("dayswemet-locale") === lang) || (lang === "ko" && !localStorage.getItem("dayswemet-locale"))
                  ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
              }`}>
              {lang === "ko" ? "한국어" : "English"}
            </button>
          ))}
        </div>
      </section>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Account</h2>
        <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); router.refresh(); }}
          className="w-full py-3 border border-border rounded-button text-sm font-semibold text-text-secondary hover:bg-background transition-colors">
          Sign Out
        </button>
      </section>
    </div>
  );
}
