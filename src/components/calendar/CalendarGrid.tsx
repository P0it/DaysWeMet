"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isToday, format,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { getMonthRange } from "@/lib/dates";
import CalendarHeader from "./CalendarHeader";
import DayOfWeekHeader from "./DayOfWeekHeader";
import CalendarCell from "./CalendarCell";
import type { CalendarDay, Event } from "@/types";

interface CalendarGridProps {
  coupleId: string;
  userId: string;
  refreshKey?: number;
}

export default function CalendarGrid({ coupleId, userId, refreshKey }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getMonthRange(currentDate);
    const { data: photos } = await supabase.rpc("get_calendar_data", {
      p_couple_id: coupleId, p_start_date: start, p_end_date: end,
    });

    const dataMap: Record<string, CalendarDay> = {};
    if (photos && photos.length > 0) {
      const paths = photos.map((p: { thumbnail_path: string }) => p.thumbnail_path).filter(Boolean);
      const signedUrlMap: Record<string, string> = {};
      if (paths.length > 0) {
        const { data: signedData } = await supabase.storage.from("photos").createSignedUrls(paths, 3600);
        if (signedData) signedData.forEach((item) => { if (item.signedUrl && item.path) signedUrlMap[item.path] = item.signedUrl; });
      }
      photos.forEach((p: { capture_date: string; photo_count: number; thumbnail_path: string }) => {
        dataMap[p.capture_date] = {
          date: p.capture_date, photoCount: Number(p.photo_count),
          representativeThumbnailUrl: signedUrlMap[p.thumbnail_path] || null, events: [],
        };
      });
    }

    const { data: events } = await supabase.from("events").select("*").eq("couple_id", coupleId)
      .gte("event_date", start).lte("event_date", end).order("event_date", { ascending: true });
    if (events) {
      events.forEach((event: Event) => {
        if (!dataMap[event.event_date]) {
          dataMap[event.event_date] = { date: event.event_date, photoCount: 0, representativeThumbnailUrl: null, events: [] };
        }
        dataMap[event.event_date].events.push(event);
      });
    }

    // Fetch date flags
    const { data: flags } = await supabase.from("date_flags").select("*").eq("couple_id", coupleId)
      .gte("flag_date", start).lte("flag_date", end);
    if (flags) {
      flags.forEach((f: { flag_date: string; met: boolean; loved: boolean }) => {
        if (!dataMap[f.flag_date]) {
          dataMap[f.flag_date] = { date: f.flag_date, photoCount: 0, representativeThumbnailUrl: null, events: [] };
        }
        dataMap[f.flag_date].flags = { met: f.met, loved: f.loved };
      });
    }

    setCalendarData(dataMap);
    setLoading(false);
  }, [currentDate, coupleId, supabase]);

  useEffect(() => { fetchCalendarData(); }, [fetchCalendarData, refreshKey]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }

  return (
    <div className="animate-fade-in">
      <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-[24px] p-4 shadow-sm">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={() => setCurrentDate((d) => subMonths(d, 1))}
          onNextMonth={() => setCurrentDate((d) => addMonths(d, 1))}
        />
        <DayOfWeekHeader />

        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center py-2">
                <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map((dayDate) => {
              const dateStr = format(dayDate, "yyyy-MM-dd");
              const dayData = calendarData[dateStr];
              return (
                <CalendarCell
                  key={dateStr}
                  date={dayDate.getDate()}
                  fullDate={dateStr}
                  thumbnailUrl={dayData?.representativeThumbnailUrl ?? undefined}
                  photoCount={dayData?.photoCount}
                  events={dayData?.events}
                  flags={dayData?.flags}
                  userId={userId}
                  isCurrentMonth={isSameMonth(dayDate, currentDate)}
                  isToday={isToday(dayDate)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
