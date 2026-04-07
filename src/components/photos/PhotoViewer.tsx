"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface PhotoViewerProps {
  urls: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete?: () => void;
}

export default function PhotoViewer({ urls, currentIndex, onClose, onPrev, onNext, onDelete }: PhotoViewerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onPrev();
    if (e.key === "ArrowRight") onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  useEffect(() => { setConfirmDelete(false); }, [currentIndex]);

  if (!mounted) return null;

  const viewer = (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999,
        backgroundColor: "rgba(0,0,0,0.93)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{ position: "absolute", top: 0, left: 0, right: 0, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
          {currentIndex + 1} / {urls.length}
        </span>
        <button type="button" onClick={onClose}
          style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Prev */}
      {currentIndex > 0 && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      )}

      {/* Next */}
      {currentIndex < urls.length - 1 && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      )}

      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[currentIndex]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "70vh", objectFit: "contain", borderRadius: 16, zIndex: 2 }}
      />

      {/* Delete bar */}
      {onDelete && (
        <div
          style={{ position: "absolute", bottom: 32, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {confirmDelete ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", borderRadius: 50, padding: "8px 16px" }}>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Delete?</span>
              <button type="button"
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                style={{ padding: "6px 18px", fontSize: 13, fontWeight: 700, backgroundColor: "#ef4444", color: "white", borderRadius: 50, border: "none", cursor: "pointer" }}>
                Yes
              </button>
              <button type="button"
                onClick={() => setConfirmDelete(false)}
                style={{ padding: "6px 18px", fontSize: 13, fontWeight: 700, backgroundColor: "rgba(255,255,255,0.2)", color: "white", borderRadius: 50, border: "none", cursor: "pointer" }}>
                No
              </button>
            </div>
          ) : (
            <button type="button"
              onClick={() => setConfirmDelete(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 50, border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 700 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete Photo
            </button>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(viewer, document.body);
}
