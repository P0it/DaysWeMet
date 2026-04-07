"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Event } from "@/types";

export default function UpcomingEvents({ coupleId, userId }: { coupleId: string; userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase.from("events").select("*").eq("couple_id", coupleId)
        .gte("event_date", today).order("event_date", { ascending: true }).limit(5);
      if (data) setEvents(data);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);

  if (events.length === 0) return null;

  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold text-text-muted mb-3 px-1">Upcoming</h2>
      <div className="space-y-2">
        {events.map((event) => {
          const isMine = event.created_by === userId;
          const eventDate = new Date(event.event_date + "T00:00:00");
          return (
            <div key={event.id} className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-[16px] p-3.5 flex items-center gap-3 shadow-sm">
              <div className="w-1.5 h-9 rounded-full flex-shrink-0"
                style={{ background: isMine ? "linear-gradient(180deg, #FF8BA7, #FF6B8A)" : "linear-gradient(180deg, #A99BF5, #7C6CF0)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{event.title}</p>
                <p className="text-xs text-text-muted">{format(eventDate, "M월 d일 (EEE)", { locale: ko })}</p>
              </div>
              {event.start_time && (
                <span className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-pill flex-shrink-0"
                  style={{ background: isMine ? "linear-gradient(135deg, #FF8BA7, #FF6B8A)" : "linear-gradient(135deg, #A99BF5, #7C6CF0)" }}>
                  {event.start_time.slice(0, 5)}{event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
