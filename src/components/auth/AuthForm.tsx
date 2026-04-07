"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/callback` } });
        if (error) throw error; setSignupSuccess(true); return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push("/calendar"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "An error occurred"); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-button text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors";

  if (signupSuccess) {
    return (
      <div className="w-full max-w-sm bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-6 text-center space-y-3">
        <p className="text-lg font-bold text-text-primary">Check your email</p>
        <p className="text-sm text-text-secondary">Confirmation link sent to <strong className="text-primary">{email}</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-text-muted mb-1.5">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-text-muted mb-1.5">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="6+ characters" className={inputClass} />
      </div>
      {error && <p className="text-sm text-accent bg-accent/10 px-3 py-2 rounded-button">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-button text-sm font-bold text-white disabled:opacity-40 transition-all"
        style={{ background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)" }}>
        {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
      </button>
    </form>
  );
}
