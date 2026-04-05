"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  format,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { getMonthRange } from "@/lib/dates";
import CalendarHeader from "./CalendarHeader";
import DayOfWeekHeader from "./DayOfWeekHeader";
import CalendarCell from "./CalendarCell";
import type { CalendarDay } from "@/types";

interface CalendarGridProps {
  coupleId: string;
}

export default function CalendarGrid({ coupleId }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<
    Record<string, CalendarDay>
  >({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getMonthRange(currentDate);

    const { data: photos } = await supabase.rpc("get_calendar_data", {
      p_couple_id: coupleId,
      p_start_date: start,
      p_end_date: end,
    });

    if (photos && photos.length > 0) {
      // Get signed URLs for thumbnails
      const paths = photos
        .map((p: { thumbnail_path: string }) => p.thumbnail_path)
        .filter(Boolean);

      const signedUrlMap: Record<string, string> = {};
      if (paths.length > 0) {
        const { data: signedData } = await supabase.storage
          .from("photos")
          .createSignedUrls(paths, 3600);

        if (signedData) {
          signedData.forEach((item) => {
            if (item.signedUrl && item.path) {
              signedUrlMap[item.path] = item.signedUrl;
            }
          });
        }
      }

      const dataMap: Record<string, CalendarDay> = {};
      photos.forEach(
        (p: {
          capture_date: string;
          photo_count: number;
          thumbnail_path: string;
        }) => {
          dataMap[p.capture_date] = {
            date: p.capture_date,
            photoCount: Number(p.photo_count),
            representativeThumbnailUrl:
              signedUrlMap[p.thumbnail_path] || null,
          };
        }
      );
      setCalendarData(dataMap);
    } else {
      setCalendarData({});
    }

    setLoading(false);
  }, [currentDate, coupleId, supabase]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const handlePrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentDate((d) => addMonths(d, 1));

  // Build calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="animate-fade-in">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <DayOfWeekHeader />

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-cell bg-surface animate-pulse"
            />
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
                isCurrentMonth={isSameMonth(dayDate, currentDate)}
                isToday={isToday(dayDate)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
