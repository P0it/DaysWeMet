"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOneYearAgo } from "@/lib/dates";
import Link from "next/link";

interface TodaysMemoryProps {
  coupleId: string;
}

export default function TodaysMemory({ coupleId }: TodaysMemoryProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [memoryDate, setMemoryDate] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const oneYearAgo = getOneYearAgo();
      setMemoryDate(oneYearAgo);

      const { data: photos, error } = await supabase
        .from("photos")
        .select("thumbnail_path")
        .eq("couple_id", coupleId)
        .eq("capture_date", oneYearAgo)
        .order("created_at", { ascending: false });

      if (error || !photos || photos.length === 0) return;

      setPhotoCount(photos.length);

      const { data: signed } = await supabase.storage
        .from("photos")
        .createSignedUrl(photos[0].thumbnail_path, 3600);

      if (signed?.signedUrl) {
        setThumbnailUrl(signed.signedUrl);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId]);

  if (!thumbnailUrl) return null;

  return (
    <Link href={`/date/${memoryDate}`} className="block mb-4 animate-fade-in">
      <div className="relative rounded-card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt="Memory from 1 year ago"
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-4">
          <div>
            <p className="text-accent text-xs font-medium mb-0.5">
              1 year ago today
            </p>
            <p className="text-white text-sm">
              {photoCount} photo{photoCount !== 1 ? "s" : ""} from this day
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
