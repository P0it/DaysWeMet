"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function JoinCoupleForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find the couple by invite code
      const { data: couple, error: coupleError } = await supabase
        .from("couples")
        .select("*")
        .eq("invite_code", code.toUpperCase())
        .is("user2_id", null)
        .single();

      if (coupleError || !couple) {
        throw new Error("Invalid or expired invite code");
      }

      if (couple.user1_id === user.id) {
        throw new Error("You cannot join your own couple");
      }

      // Join the couple
      const { error: updateError } = await supabase
        .from("couples")
        .update({
          user2_id: user.id,
          connected_at: new Date().toISOString(),
        })
        .eq("id", couple.id);

      if (updateError) throw updateError;

      // Update profile
      await supabase
        .from("profiles")
        .update({ couple_id: couple.id })
        .eq("id", user.id);

      router.push("/calendar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label
          htmlFor="invite-code"
          className="block text-sm text-text-secondary mb-1.5"
        >
          Invite Code
        </label>
        <input
          id="invite-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          required
          className="w-full px-4 py-3 bg-surface border border-border rounded-button text-text-primary text-center text-xl font-mono tracking-widest placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          placeholder="ABCD1234"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-button">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || code.length < 8}
        className="w-full py-3 bg-primary text-background font-medium rounded-button hover:bg-primary-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Joining..." : "Join Couple"}
      </button>
    </form>
  );
}
