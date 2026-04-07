"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/invite-code";
import Link from "next/link";
import type { Couple } from "@/types";

export default function CouplePage() {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadCouple();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCouple() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", user.id)
      .single();

    if (profile?.couple_id) {
      const { data: coupleData } = await supabase
        .from("couples")
        .select("*")
        .eq("id", profile.couple_id)
        .single();
      setCouple(coupleData);
    }
    setLoading(false);
  }

  async function handleCreateCouple() {
    setCreating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const inviteCode = generateInviteCode();

      const { data: newCouple, error } = await supabase
        .from("couples")
        .insert({
          user1_id: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("profiles")
        .update({ couple_id: newCouple.id })
        .eq("id", user.id);

      setCouple(newCouple);
    } catch (err) {
      console.error("Failed to create couple:", err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already in a couple
  if (couple) {
    return (
      <div className="py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Couple Connected
          </h1>
          {couple.user2_id ? (
            <p className="text-text-secondary">
              You&apos;re connected! Start uploading your memories.
            </p>
          ) : (
            <p className="text-text-secondary">
              Waiting for your partner to join...
            </p>
          )}
        </div>

        <div className="bg-white/30 backdrop-blur-md border border-white/40 rounded-[18px] p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Invite Code</p>
          <p className="text-2xl font-mono font-extrabold text-primary tracking-[0.15em]">{couple.invite_code}</p>
        </div>

        {couple.user2_id && (
          <Link
            href="/calendar"
            className="block text-center py-3 bg-primary text-background font-medium rounded-button hover:bg-primary-muted transition-colors"
          >
            Go to Calendar
          </Link>
        )}
      </div>
    );
  }

  // No couple yet
  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Connect with your partner
        </h1>
        <p className="text-text-secondary text-sm">
          Create a couple or join with an invite code
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleCreateCouple}
          disabled={creating}
          className="w-full py-4 bg-primary text-background font-medium rounded-card hover:bg-primary-muted transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create New Couple"}
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-sm">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link
          href="/couple/join"
          className="block text-center w-full py-4 bg-surface border border-border text-text-primary font-medium rounded-card hover:bg-surface-elevated transition-colors"
        >
          Join with Invite Code
        </Link>
      </div>
    </div>
  );
}
