"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import PhotoGrid from "@/components/photos/PhotoGrid";
import Link from "next/link";
import type { Photo } from "@/types";

export default function DateDetailPage() {
  const params = useParams();
  const dateStr = params.date as string;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [originalUrls, setOriginalUrls] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("couple_id")
        .eq("id", user.id)
        .single();

      if (!profile?.couple_id) return;
      setCoupleId(profile.couple_id);

      // Fetch photos
      const { data: photoData } = await supabase
        .from("photos")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .eq("capture_date", dateStr)
        .order("created_at", { ascending: true });

      if (photoData) {
        setPhotos(photoData);

        // Get signed URLs
        const thumbPaths = photoData.map((p) => p.thumbnail_path);
        const origPaths = photoData.map((p) => p.storage_path);

        if (thumbPaths.length > 0) {
          const { data: thumbSigned } = await supabase.storage
            .from("photos")
            .createSignedUrls(thumbPaths, 3600);
          setThumbnailUrls(
            thumbSigned?.map((s) => s.signedUrl).filter(Boolean) as string[] ?? []
          );
        }

        if (origPaths.length > 0) {
          const { data: origSigned } = await supabase.storage
            .from("photos")
            .createSignedUrls(origPaths, 3600);
          setOriginalUrls(
            origSigned?.map((s) => s.signedUrl).filter(Boolean) as string[] ?? []
          );
        }
      }

      // Fetch memo
      const { data: memoData } = await supabase
        .from("memos")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .eq("memo_date", dateStr)
        .single();

      if (memoData) {
        setMemo(memoData.content);
      }

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  const handleSaveMemo = async () => {
    if (!coupleId) return;
    setMemoSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("memos").upsert(
      {
        couple_id: coupleId,
        memo_date: dateStr,
        content: memo,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "couple_id,memo_date" }
    );

    setMemoSaving(false);
  };

  const displayDate = (() => {
    try {
      return format(new Date(dateStr + "T00:00:00"), "yyyy\ub144 M\uc6d4 d\uc77c");
    } catch {
      return dateStr;
    }
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-2 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/calendar"
          className="p-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {displayDate}
          </h1>
          <p className="text-xs text-text-muted">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Photo grid */}
      <PhotoGrid thumbnailUrls={thumbnailUrls} originalUrls={originalUrls} />

      {/* Memo */}
      <div className="space-y-2">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={handleSaveMemo}
          placeholder="Write a note about this day..."
          rows={2}
          className="w-full px-4 py-3 bg-surface border border-border rounded-card text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors"
        />
        {memoSaving && (
          <p className="text-xs text-text-muted">Saving...</p>
        )}
      </div>
    </div>
  );
}
