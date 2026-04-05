"use client";

import { useState, useRef } from "react";
import { extractCaptureDate } from "@/lib/exif";
import { formatDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  captureDate: string;
  status: "pending" | "uploading" | "done" | "error";
}

interface PhotoUploaderProps {
  coupleId: string;
}

export default function PhotoUploader({ coupleId }: PhotoUploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const entries: FileEntry[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      const exifDate = await extractCaptureDate(file);
      entries.push({
        id: nanoid(),
        file,
        preview: URL.createObjectURL(file),
        captureDate: exifDate ? formatDate(exifDate) : formatDate(new Date()),
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...entries]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDateChange = (id: string, date: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, captureDate: date } : f))
    );
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUpload = async () => {
    setUploading(true);

    for (const entry of files) {
      if (entry.status === "done") continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, status: "uploading" } : f
        )
      );

      try {
        const fileId = nanoid();
        const ext = entry.file.name.split(".").pop() || "jpg";
        const storagePath = `${coupleId}/originals/${fileId}.${ext}`;
        const thumbnailPath = `${coupleId}/thumbnails/${fileId}.${ext}`;

        // Upload original
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(storagePath, entry.file);

        if (uploadError) throw uploadError;

        // Upload thumbnail (same file for now; Supabase image transforms handle resize)
        const { error: thumbError } = await supabase.storage
          .from("photos")
          .upload(thumbnailPath, entry.file);

        if (thumbError) {
          console.warn("Thumbnail upload failed, using original");
        }

        // Insert photo record
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { error: dbError } = await supabase.from("photos").insert({
          couple_id: coupleId,
          capture_date: entry.captureDate,
          storage_path: storagePath,
          thumbnail_path: thumbError ? storagePath : thumbnailPath,
          original_filename: entry.file.name,
          uploaded_by: user?.id,
        });

        if (dbError) throw dbError;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: "done" } : f
          )
        );
      } catch (err) {
        console.error("Upload failed:", err);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: "error" } : f
          )
        );
      }
    }

    setUploading(false);
  };

  const pendingCount = files.filter(
    (f) => f.status === "pending" || f.status === "error"
  ).length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6">
      {/* File input area */}
      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-border rounded-card p-8 text-center hover:border-primary/50 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3 text-text-muted"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <p className="text-text-secondary text-sm">
            Tap to select photos
          </p>
          <p className="text-text-muted text-xs mt-1">
            Dates are automatically extracted from photos
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {files.length} photo{files.length !== 1 ? "s" : ""} selected
              {doneCount > 0 && ` (${doneCount} uploaded)`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {files.map((entry) => (
              <div
                key={entry.id}
                className="relative bg-surface rounded-cell overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.preview}
                  alt=""
                  className={`w-full aspect-square object-cover ${
                    entry.status === "done" ? "opacity-60" : ""
                  }`}
                />

                {/* Status overlay */}
                {entry.status === "uploading" && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {entry.status === "done" && (
                  <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-green-400"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                {entry.status === "error" && (
                  <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                    <span className="text-red-400 text-xs font-medium">
                      Failed
                    </span>
                  </div>
                )}

                {/* Date */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <input
                    type="date"
                    value={entry.captureDate}
                    onChange={(e) =>
                      handleDateChange(entry.id, e.target.value)
                    }
                    disabled={entry.status !== "pending"}
                    className="w-full bg-transparent text-white text-xs focus:outline-none"
                  />
                </div>

                {/* Remove button */}
                {entry.status === "pending" && (
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-background/60 rounded-full flex items-center justify-center text-text-primary hover:bg-background/80"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload button */}
          {pendingCount > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3 bg-primary text-background font-medium rounded-button hover:bg-primary-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading..."
                : `Upload ${pendingCount} Photo${pendingCount !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
