"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * BackgroundImage — 커플 배경 사진을 앱 배경으로 표시
 * Storage: photos bucket, {couple_id}/background 경로
 */
export default function BackgroundImage() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("couple_id")
        .eq("id", user.id)
        .single();

      if (!profile?.couple_id) return;

      // Try to get signed URL for background image
      const { data } = await supabase.storage
        .from("photos")
        .createSignedUrl(`${profile.couple_id}/background`, 86400);

      if (data?.signedUrl) {
        setBgUrl(data.signedUrl);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bgUrl) return null;

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
    </div>
  );
}
