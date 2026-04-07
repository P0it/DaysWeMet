"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/types";

interface PhotoStackProps {
  photos: Photo[];
  thumbnailUrls: string[];
  originalUrls: string[];
  onDelete?: (photo: Photo) => Promise<void> | void;
  onSetRepresentative?: (photo: Photo) => Promise<void> | void;
}

/**
 * PhotoStack — 상단 카드 스택 (스와이프) + 하단 썸네일 슬라이드
 * 레퍼런스: 네이버 카드 스택 스와이프 UI
 */
export default function PhotoStack({ photos, thumbnailUrls, originalUrls, onDelete, onSetRepresentative }: PhotoStackProps) {
  const [current, setCurrent] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const thumbRef = useRef<HTMLDivElement>(null);

  const total = thumbnailUrls.length;

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(idx, total - 1)));
    setConfirmDelete(false);
  }, [total]);

  if (total === 0) return null;

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    startX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragX(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragX(x - startX.current);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < -50 && current < total - 1) goTo(current + 1);
    else if (dragX > 50 && current > 0) goTo(current - 1);
    setDragX(0);
  };

  // Scroll thumbnail strip when current changes
  const scrollThumb = (idx: number) => {
    goTo(idx);
    if (thumbRef.current) {
      const child = thumbRef.current.children[idx] as HTMLElement;
      if (child) child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <>
      {/* Card stack area */}
      <div className="relative w-full aspect-[3/2] mb-3 max-h-[45vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => { if (isDragging) handleTouchEnd(); }}
      >
        {/* Stacked cards behind */}
        {total > 1 && current < total - 1 && (
          <div className="absolute inset-x-3 top-2 bottom-0 rounded-[20px] bg-white/30 backdrop-blur-sm border border-white/30"
            style={{ transform: "rotate(2deg)" }} />
        )}
        {total > 2 && current < total - 2 && (
          <div className="absolute inset-x-5 top-4 bottom-0 rounded-[20px] bg-white/20 border border-white/20"
            style={{ transform: "rotate(-1.5deg)" }} />
        )}

        {/* Main card */}
        <div
          className="relative w-full h-full rounded-[20px] overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 select-none"
          style={{
            transform: isDragging ? `translateX(${dragX}px) rotate(${dragX * 0.02}deg)` : undefined,
            transition: isDragging ? "none" : "transform 0.3s ease",
            cursor: "grab",
          }}
          onClick={() => !isDragging && setViewerOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrls[current]}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Counter badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-pill text-[11px] font-semibold text-white">
            {current + 1} / {total}
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div ref={thumbRef} className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
          {thumbnailUrls.map((url, i) => (
            <button
              key={photos[i]?.id ?? i}
              onClick={() => scrollThumb(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-[12px] overflow-hidden transition-all ${
                i === current ? "ring-2 ring-primary scale-105" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}

      {/* Actions below thumbnails */}
      <div className="mt-2 flex items-center justify-center gap-4">
        {/* Set as representative */}
        {onSetRepresentative && total > 1 && (
          <button onClick={async () => { await onSetRepresentative(photos[current]); }}
            className="text-xs font-semibold text-primary hover:underline transition-colors">
            Set as Cover
          </button>
        )}
        {/* Delete */}
        {onDelete && (
          confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary text-xs">Delete?</span>
              <button onClick={async () => { setConfirmDelete(false); await onDelete(photos[current]); if (current >= photos.length - 1 && current > 0) setCurrent(current - 1); }}
                className="px-3 py-1 rounded-pill text-xs font-bold text-white bg-accent">Yes</button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 rounded-pill text-xs font-bold text-text-muted border border-border">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="text-xs font-semibold text-text-muted hover:text-accent transition-colors">
              Delete
            </button>
          )
        )}
      </div>

      {/* Full-screen viewer via portal */}
      {viewerOpen && <FullViewer
        urls={originalUrls}
        current={current}
        total={total}
        onClose={() => setViewerOpen(false)}
        onPrev={() => goTo(current - 1)}
        onNext={() => goTo(current + 1)}
        onChange={goTo}
      />}
    </>
  );
}

/* Full-screen photo viewer (portal) */
function FullViewer({ urls, current, total, onClose, onPrev, onNext, onChange }: {
  urls: string[]; current: number; total: number;
  onClose: () => void; onPrev: () => void; onNext: () => void; onChange: (i: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useState(() => { setMounted(true); });

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.93)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      {/* Counter */}
      <div style={{ position: "absolute", top: 16, left: 0, right: 0, textAlign: "center", zIndex: 3 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{current + 1} / {total}</span>
      </div>

      {/* Close */}
      <button type="button" onClick={onClose}
        style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 3 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      {/* Nav */}
      {current > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); onPrev(); }}
        style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 3 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
      </button>}
      {current < total - 1 && <button type="button" onClick={(e) => { e.stopPropagation(); onNext(); }}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 3 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
      </button>}

      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={urls[current]} alt="" onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "75vh", objectFit: "contain", borderRadius: 16, zIndex: 2 }} />

      {/* Bottom dots */}
      {total > 1 && (
        <div style={{ position: "absolute", bottom: 24, display: "flex", gap: 6, zIndex: 3 }} onClick={(e) => e.stopPropagation()}>
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} type="button" onClick={() => onChange(i)}
              style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === current ? "#FF6B8A" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.2s" }} />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
