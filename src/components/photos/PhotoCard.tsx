"use client";

interface PhotoCardProps {
  thumbnailUrl: string;
  onClick: () => void;
}

export default function PhotoCard({ thumbnailUrl, onClick }: PhotoCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-cell overflow-hidden group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt=""
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </button>
  );
}
