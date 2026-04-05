"use client";

import { useState } from "react";
import PhotoCard from "./PhotoCard";
import PhotoViewer from "./PhotoViewer";

interface PhotoGridProps {
  thumbnailUrls: string[];
  originalUrls: string[];
}

export default function PhotoGrid({
  thumbnailUrls,
  originalUrls,
}: PhotoGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (thumbnailUrls.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-muted">No photos for this day</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {thumbnailUrls.map((url, i) => (
          <PhotoCard
            key={i}
            thumbnailUrl={url}
            onClick={() => setViewerIndex(i)}
          />
        ))}
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          urls={originalUrls}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onPrev={() =>
            setViewerIndex((i) => (i !== null && i > 0 ? i - 1 : i))
          }
          onNext={() =>
            setViewerIndex((i) =>
              i !== null && i < originalUrls.length - 1 ? i + 1 : i
            )
          }
        />
      )}
    </>
  );
}
