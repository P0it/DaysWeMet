"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { differenceInDays, format, addYears, isAfter } from "date-fns";

interface Anniversary { label: string; date: Date; daysLeft: number; }

function getUpcoming(start: Date, today: Date): Anniversary | null {
  const list: Anniversary[] = [];
  for (let y = 1; y <= 100; y++) { const d = addYears(start, y); if (isAfter(d, today)) { list.push({ label: `${y}주년`, date: d, daysLeft: differenceInDays(d, today) }); break; } }
  for (let d = 100; d <= 10000; d += 100) { const dt = new Date(start); dt.setDate(dt.getDate() + d); if (isAfter(dt, today)) { list.push({ label: `${d}일`, date: dt, daysLeft: differenceInDays(dt, today) }); break; } }
  list.sort((a, b) => a.daysLeft - b.daysLeft);
  return list[0] ?? null;
}

export default function CoupleStats({ coupleId }: { coupleId: string }) {
  const [days, setDays] = useState<number | null>(null);
  const [anniversary, setAnniversary] = useState<Anniversary | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("couples").select("connected_at").eq("id", coupleId).single();
      if (!data?.connected_at) return;
      const s = new Date(data.connected_at); const t = new Date(); t.setHours(0, 0, 0, 0);
      setDays(differenceInDays(t, s) + 1);
      setAnniversary(getUpcoming(s, t));
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-[18px] p-4 text-center shadow-sm">
        <p className="text-[11px] font-semibold text-text-muted mb-1">Together</p>
        {days !== null ? (
          <p className="text-2xl font-extrabold" style={{ background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            D+{days}
          </p>
        ) : <p className="text-lg text-text-muted">-</p>}
      </div>
      <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-[18px] p-4 text-center shadow-sm">
        <p className="text-[11px] font-semibold text-text-muted mb-1">
          {anniversary ? anniversary.label : "Anniversary"}
        </p>
        {anniversary ? (
          <>
            <p className="text-2xl font-extrabold" style={{ background: "linear-gradient(135deg, #A99BF5, #7C6CF0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              D-{anniversary.daysLeft}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">{format(anniversary.date, "yyyy.MM.dd")}</p>
          </>
        ) : <p className="text-lg text-text-muted">-</p>}
      </div>
    </div>
  );
}
