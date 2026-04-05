"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PhotoUploader from "@/components/photos/PhotoUploader";

export default function UploadPage() {
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

      setCoupleId(profile?.couple_id ?? null);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupleId) {
    return (
      <div className="py-8 text-center">
        <p className="text-text-secondary">
          Connect with your partner first to upload photos.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Upload Photos</h1>
        <p className="text-sm text-text-secondary mt-1">
          Add photos to your shared calendar
        </p>
      </div>
      <PhotoUploader coupleId={coupleId} />
    </div>
  );
}
