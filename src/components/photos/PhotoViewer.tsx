"use client";

import { useEffect, useCallback } from "react";

interface PhotoViewerProps {
  urls: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function PhotoViewer({
  urls,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoViewerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-2 p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
      {currentIndex < urls.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-2 p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[currentIndex]}
        alt=""
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-card"
      />

      {/* Counter */}
      <div className="absolute bottom-4 text-sm text-text-muted">
        {currentIndex + 1} / {urls.length}
      </div>
    </div>
  );
}
