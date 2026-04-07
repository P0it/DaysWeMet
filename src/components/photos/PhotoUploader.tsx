"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

interface UploadingFile {
  id: string;
  preview: string;
  status: "uploading" | "done" | "error";
}

export default function PhotoUploader({ coupleId, captureDate, onUploadComplete }: {
  coupleId: string; captureDate?: string; onUploadComplete?: () => void;
}) {
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFile = async (file: File) => {
    const id = nanoid();
    const preview = URL.createObjectURL(file);
    setUploads((prev) => [...prev, { id, preview, status: "uploading" }]);

    try {
      const date = captureDate || new Date().toISOString().slice(0, 10);
      const ext = file.name.split(".").pop() || "jpg";
      const fid = nanoid();
      const sp = `${coupleId}/originals/${fid}.${ext}`;
      const tp = `${coupleId}/thumbnails/${fid}.${ext}`;

      const { error: ue } = await supabase.storage.from("photos").upload(sp, file);
      if (ue) throw ue;
      await supabase.storage.from("photos").upload(tp, file);

      const { data: { user } } = await supabase.auth.getUser();
      const { error: de } = await supabase.from("photos").insert({
        couple_id: coupleId, capture_date: date, storage_path: sp,
        thumbnail_path: tp, original_filename: file.name, uploaded_by: user?.id,
      });
      if (de) throw de;

      setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: "done" } : u));
    } catch {
      setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: "error" } : u));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    // Upload all files immediately in parallel
    const promises = Array.from(selected).map((file) => uploadFile(file));
    await Promise.all(promises);

    if (inputRef.current) inputRef.current.value = "";
    if (onUploadComplete) onUploadComplete();

    // Clear done uploads after a delay
    setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.status !== "done"));
    }, 1500);
  };

  return (
    <div>
      <label className="block cursor-pointer">
        <div className="py-3 text-center text-sm font-semibold text-primary border border-dashed border-primary/30 rounded-card hover:bg-primary-pale/30 transition-colors">
          + Add Photos
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
      </label>

      {uploads.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {uploads.map((u) => (
            <div key={u.id} className="relative w-16 h-16 rounded-[12px] overflow-hidden flex-shrink-0 bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.preview} alt="" className="w-full h-full object-cover" />
              {u.status === "uploading" && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {u.status === "done" && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
              {u.status === "error" && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-red-600">!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
