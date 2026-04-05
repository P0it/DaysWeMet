"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import TodaysMemory from "@/components/memory/TodaysMemory";

export default function CalendarPage() {
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("couple_id")
        .eq("id", user.id)
        .single();

      setCoupleId(profile?.couple_id ?? null);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupleId) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-secondary">
          Connect with your partner to see your shared calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <TodaysMemory coupleId={coupleId} />
      <CalendarGrid coupleId={coupleId} />
    </div>
  );
}
