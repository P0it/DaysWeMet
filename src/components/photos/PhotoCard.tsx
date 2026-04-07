"use client";

export default function PhotoCard({ thumbnailUrl, onClick }: { thumbnailUrl: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative aspect-square rounded-[14px] overflow-hidden active:scale-95 transition-transform bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
    </button>
  );
}
