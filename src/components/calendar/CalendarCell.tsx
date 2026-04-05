"use client";

import Link from "next/link";

interface CalendarCellProps {
  date: number;
  fullDate: string;
  thumbnailUrl?: string;
  photoCount?: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function CalendarCell({
  date,
  fullDate,
  thumbnailUrl,
  photoCount,
  isCurrentMonth,
  isToday,
}: CalendarCellProps) {
  const content = (
    <div
      className={`relative aspect-square rounded-cell overflow-hidden group transition-transform duration-200 ${
        isCurrentMonth ? "" : "opacity-30"
      }`}
    >
      {/* Background: photo or empty */}
      {thumbnailUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
        </>
      ) : (
        <div
          className={`w-full h-full ${
            isCurrentMonth ? "bg-surface" : "bg-background"
          }`}
        />
      )}

      {/* Date number - top left */}
      <span
        className={`absolute top-1 left-1.5 text-xs font-medium ${
          thumbnailUrl
            ? "text-white drop-shadow-md"
            : isToday
              ? "text-accent font-bold"
              : "text-text-secondary"
        }`}
      >
        {date}
      </span>

      {/* Photo count - bottom right */}
      {photoCount && photoCount > 0 && (
        <span className="absolute bottom-1 right-1.5 text-[10px] font-medium text-white/80 drop-shadow-md">
          {photoCount}
        </span>
      )}

      {/* Today indicator */}
      {isToday && !thumbnailUrl && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
      )}
    </div>
  );

  if (!isCurrentMonth) {
    return <div>{content}</div>;
  }

  return (
    <Link href={`/date/${fullDate}`} className="block">
      {content}
    </Link>
  );
}
