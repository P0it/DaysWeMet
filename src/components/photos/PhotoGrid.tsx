"use client";

import { useState } from "react";
import PhotoCard from "./PhotoCard";
import PhotoViewer from "./PhotoViewer";
import type { Photo } from "@/types";

interface PhotoGridProps {
  photos: Photo[];
  thumbnailUrls: string[];
  originalUrls: string[];
  onDelete?: (photo: Photo) => Promise<void> | void;
}

export default function PhotoGrid({ photos, thumbnailUrls, originalUrls, onDelete }: PhotoGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (thumbnailUrls.length === 0) return null;

  const handleDelete = async () => {
    if (viewerIndex === null || !onDelete) return;
    const photo = photos[viewerIndex];

    // Close viewer first, then delete
    if (photos.length <= 1) {
      setViewerIndex(null);
    } else if (viewerIndex >= photos.length - 1) {
      setViewerIndex(viewerIndex - 1);
    }

    await onDelete(photo);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {thumbnailUrls.map((url, i) => (
          <PhotoCard key={photos[i]?.id ?? i} thumbnailUrl={url} onClick={() => setViewerIndex(i)} />
        ))}
      </div>

      {viewerIndex !== null && viewerIndex < originalUrls.length && (
        <PhotoViewer
          urls={originalUrls}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onPrev={() => setViewerIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setViewerIndex((i) => (i !== null && i < originalUrls.length - 1 ? i + 1 : i))}
          onDelete={onDelete ? handleDelete : undefined}
        />
      )}
    </>
  );
}
