"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Tab = "schedule" | "place";

const PLACE_CATEGORIES = [
  { value: "restaurant", label: "Food" },
  { value: "cafe", label: "Cafe" },
  { value: "bar", label: "Bar" },
  { value: "travel", label: "Travel" },
  { value: "shopping", label: "Shop" },
  { value: "movie", label: "Movie" },
  { value: "park", label: "Park" },
  { value: "etc", label: "Other" },
];

export default function AddRecordPage() {
  const params = useParams();
  const router = useRouter();
  const dateStr = params.date as string;
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") === "place" ? "place" : "schedule") as Tab;
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [scheduleTitle, setScheduleTitle] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [placeName, setPlaceName] = useState("");
  const [placeCategory, setPlaceCategory] = useState("restaurant");
  const [placeNote, setPlaceNote] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("couple_id").eq("id", user.id).single();
      setCoupleId(profile?.couple_id ?? null);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!coupleId) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (tab === "schedule" && scheduleTitle.trim()) {
      await supabase.from("events").insert({
        couple_id: coupleId, title: scheduleTitle.trim(), event_date: dateStr,
        start_time: allDay ? null : startTime || null, end_time: allDay ? null : endTime || null,
        color: "#FF6B8A", created_by: user?.id,
      });
    }
    if (tab === "place" && placeName.trim()) {
      await supabase.from("places").insert({
        couple_id: coupleId, visit_date: dateStr, name: placeName.trim(),
        category: placeCategory, note: placeNote.trim() || null, created_by: user?.id,
      });
    }

    setSaving(false);
    router.push(`/date/${dateStr}`);
  };

  const displayDate = (() => { try { const d = new Date(dateStr + "T00:00:00"); return `${d.getMonth() + 1}월 ${d.getDate()}일`; } catch { return dateStr; } })();
  const isValid = tab === "schedule" ? scheduleTitle.trim().length > 0 : placeName.trim().length > 0;

  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-button text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="py-2 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/date/${dateStr}`} className="p-1.5 rounded-full hover:bg-border/50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-extrabold text-text-primary">Add Record</h1>
          <p className="text-xs text-text-muted">{displayDate}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-background border border-border rounded-card mb-5">
        {(["schedule", "place"] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-[16px] text-sm font-semibold transition-all ${
              tab === t ? "bg-white text-text-primary shadow-sm" : "text-text-muted"
            }`}>
            {t === "schedule" ? "Schedule" : "Place"}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-card p-5 space-y-4">
        {tab === "schedule" ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Title</label>
              <input type="text" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="Meeting, Dinner, etc." autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Time</label>
              <button type="button" onClick={() => setAllDay(!allDay)} className="flex items-center gap-2 mb-2">
                <div className={`w-10 h-[22px] rounded-full relative transition-colors ${allDay ? "bg-primary" : "bg-border"}`}>
                  <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all ${allDay ? "left-[22px]" : "left-[3px]"}`} />
                </div>
                <span className="text-sm text-text-secondary">All day</span>
              </button>
              {!allDay && (
                <div className="flex gap-2 items-center">
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                  <span className="text-text-muted text-sm">~</span>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {PLACE_CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setPlaceCategory(cat.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-pill text-xs font-semibold transition-all border ${
                      placeCategory === cat.value ? "bg-primary text-white border-primary" : "bg-background text-text-muted border-border"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Name</label>
              <input type="text" value={placeName} onChange={(e) => setPlaceName(e.target.value)}
                placeholder="Where did you go?" autoFocus className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Note</label>
              <input type="text" value={placeNote} onChange={(e) => setPlaceNote(e.target.value)}
                placeholder="Optional" className={inputClass} />
            </div>
          </>
        )}
      </div>

      {/* Save */}
      <button type="button" onClick={handleSave} disabled={saving || !isValid}
        className="w-full mt-5 py-3.5 rounded-button text-sm font-bold text-white transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)" }}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
