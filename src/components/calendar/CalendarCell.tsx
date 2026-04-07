"use client";

import Link from "next/link";
import type { Event } from "@/types";

interface DateFlags {
  met?: boolean;
  loved?: boolean;
}

interface CalendarCellProps {
  date: number;
  fullDate: string;
  thumbnailUrl?: string;
  photoCount?: number;
  events?: Event[];
  flags?: DateFlags;
  userId?: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function CalendarCell({
  date, fullDate, thumbnailUrl, events, flags, userId, isCurrentMonth, isToday,
}: CalendarCellProps) {
  const myEvents = events?.filter((e) => e.created_by === userId) ?? [];
  const partnerEvents = events?.filter((e) => e.created_by !== userId) ?? [];
  const hasPhoto = !!thumbnailUrl;
  const didMeet = flags?.met;
  const didLove = flags?.loved;

  // Cell background: today = pink glass, met = warm glass, default = glass
  const cellBg = isToday
    ? "bg-pink-200/30 ring-2 ring-primary/30"
    : didMeet
      ? "bg-pink-200/50"
      : "bg-white/20";

  const content = (
    <div className={`relative aspect-square rounded-[10px] p-[3px] flex flex-col transition-all ${
      isCurrentMonth ? cellBg : "opacity-20"
    } backdrop-blur-sm border border-white/30 shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.3)]`}>

      {/* Top row: date + love icon */}
      <div className="flex items-start justify-between">
        <span className={`text-[10px] font-bold leading-none ${
          isToday ? "text-primary" : "text-text-secondary"
        }`}>
          {date}
        </span>
        {didLove && <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />}
      </div>

      {/* Center: photo thumbnail */}
      <div className="flex-1 flex items-center justify-center">
        {hasPhoto && (
          <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Bottom: event bars */}
      <div className="flex items-center justify-center gap-[2px] h-[6px]">
        {myEvents.length > 0 && <div className="w-2 h-[2px] rounded-full" style={{ background: "#FF6B8A" }} />}
        {partnerEvents.length > 0 && <div className="w-2 h-[2px] rounded-full" style={{ background: "#7C6CF0" }} />}
        {didMeet && !hasPhoto && !myEvents.length && !partnerEvents.length && (
          <div className="w-2 h-[2px] rounded-full bg-pink-300" />
        )}
      </div>
    </div>
  );

  if (!isCurrentMonth) return <div>{content}</div>;
  return <Link href={`/date/${fullDate}`} className="block">{content}</Link>;
}
