"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { t } from "@/lib/i18n";
import PhotoStack from "@/components/photos/PhotoStack";
import PhotoUploader from "@/components/photos/PhotoUploader";
import Link from "next/link";
import type { Photo, Event, Place } from "@/types";

const PLACE_LABEL: Record<string, string> = {
  restaurant: "Food", cafe: "Cafe", bar: "Bar",
  travel: "Travel", shopping: "Shop", movie: "Movie",
  park: "Park", etc: "Etc",
};

function naverMapUrl(name: string) {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
}

export default function DateDetailPage() {
  const params = useParams();
  const dateStr = params.date as string;
  const supabase = createClient();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [originalUrls, setOriginalUrls] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [memo, setMemo] = useState("");
  const [memoSaving, setMemoSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [flagMet, setFlagMet] = useState(false);
  const [flagLoved, setFlagLoved] = useState(false);

  const loadAll = async (cid: string) => {
    const { data: pd } = await supabase.from("photos").select("*").eq("couple_id", cid).eq("capture_date", dateStr).order("created_at", { ascending: true });
    if (pd) {
      setPhotos(pd);
      const tp = pd.map((p) => p.thumbnail_path); const op = pd.map((p) => p.storage_path);
      if (tp.length > 0) { const { data: ts } = await supabase.storage.from("photos").createSignedUrls(tp, 3600); setThumbnailUrls(ts?.map((s) => s.signedUrl).filter(Boolean) as string[] ?? []); } else { setThumbnailUrls([]); }
      if (op.length > 0) { const { data: os } = await supabase.storage.from("photos").createSignedUrls(op, 3600); setOriginalUrls(os?.map((s) => s.signedUrl).filter(Boolean) as string[] ?? []); } else { setOriginalUrls([]); }
    }
    const { data: ed } = await supabase.from("events").select("*").eq("couple_id", cid).eq("event_date", dateStr).order("start_time", { ascending: true, nullsFirst: true });
    if (ed) setEvents(ed);
    const { data: pld } = await supabase.from("places").select("*").eq("couple_id", cid).eq("visit_date", dateStr).order("created_at", { ascending: true });
    if (pld) setPlaces(pld);
    const { data: fl } = await supabase.from("date_flags").select("*").eq("couple_id", cid).eq("flag_date", dateStr).single();
    if (fl) { setFlagMet(fl.met); setFlagLoved(fl.loved); }
  };

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("couple_id").eq("id", user.id).single();
      if (!profile?.couple_id) return;
      setCoupleId(profile.couple_id);
      await loadAll(profile.couple_id);
      const { data: md } = await supabase.from("memos").select("*").eq("couple_id", profile.couple_id).eq("memo_date", dateStr).single();
      if (md) setMemo(md.content);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  const handleSaveMemo = async () => {
    if (!coupleId) return;
    setMemoSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("memos").upsert(
      { couple_id: coupleId, memo_date: dateStr, content: memo, updated_by: user?.id, updated_at: new Date().toISOString() },
      { onConflict: "couple_id,memo_date" }
    );
    setMemoSaving(false);
  };

  const handleToggleFlag = async (field: "met" | "loved", value: boolean) => {
    if (!coupleId) return;
    if (field === "met") setFlagMet(value); else setFlagLoved(value);
    const { data: { user } } = await supabase.auth.getUser();
    const fullFlags = { met: field === "met" ? value : flagMet, loved: field === "loved" ? value : flagLoved };
    await supabase.from("date_flags").upsert(
      { couple_id: coupleId, flag_date: dateStr, ...fullFlags, updated_by: user?.id, updated_at: new Date().toISOString() },
      { onConflict: "couple_id,flag_date" }
    );
  };

  const handleDeletePhoto = async (photo: Photo) => {
    await supabase.storage.from("photos").remove([photo.storage_path, photo.thumbnail_path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    if (coupleId) await loadAll(coupleId);
  };

  const handleSetRepresentative = async (photo: Photo) => {
    if (!coupleId) return;
    await supabase.from("photos").update({ created_at: new Date().toISOString() }).eq("id", photo.id);
    if (coupleId) await loadAll(coupleId);
  };

  const handleDeleteEvent = async (id: string) => { await supabase.from("events").delete().eq("id", id); if (coupleId) await loadAll(coupleId); };
  const handleDeletePlace = async (id: string) => { await supabase.from("places").delete().eq("id", id); if (coupleId) await loadAll(coupleId); };

  const displayDate = (() => { try { return format(new Date(dateStr + "T00:00:00"), "M월 d일 (EEE)", { locale: ko }); } catch { return dateStr; } })();
  const displayYear = (() => { try { return format(new Date(dateStr + "T00:00:00"), "yyyy"); } catch { return ""; } })();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-3xl animate-heartbeat">...</span></div>;
  }

  return (
    <div className="py-2 space-y-4 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/calendar" className="p-1.5 rounded-full hover:bg-white/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-text-primary">{displayDate}</h1>
          <p className="text-[11px] text-text-muted">{displayYear}</p>
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <PhotoStack photos={photos} thumbnailUrls={thumbnailUrls} originalUrls={originalUrls}
          onDelete={handleDeletePhoto} onSetRepresentative={handleSetRepresentative} />
      )}
      {coupleId && <PhotoUploader coupleId={coupleId} captureDate={dateStr} onUploadComplete={() => loadAll(coupleId)} />}

      {/* Date flags */}
      <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-[16px] p-3 space-y-2">
        <label className="flex items-center justify-between cursor-pointer select-none py-1">
          <span className="text-sm text-text-primary font-medium">{t("didWeMeet")}</span>
          <input type="checkbox" checked={flagMet} onChange={(e) => handleToggleFlag("met", e.target.checked)}
            className="w-5 h-5 rounded accent-primary cursor-pointer" />
        </label>
        <div className="h-px bg-white/30" />
        <label className="flex items-center justify-between cursor-pointer select-none py-1">
          <span className="text-sm text-text-primary font-medium">{t("didWeLove")}</span>
          <input type="checkbox" checked={flagLoved} onChange={(e) => handleToggleFlag("loved", e.target.checked)}
            className="w-5 h-5 rounded accent-primary cursor-pointer" />
        </label>
      </div>

      {/* Schedule */}
      {events.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">{t("schedule")}</h3>
          <div className="space-y-2">
            {events.map((event) => {
              const isMine = event.created_by === userId;
              return (
                <div key={event.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-[16px] p-3 flex items-center gap-3 group">
                  <div className="w-1 h-7 rounded-full flex-shrink-0"
                    style={{ background: isMine ? "linear-gradient(180deg, #FF8BA7, #FF6B8A)" : "linear-gradient(180deg, #A99BF5, #7C6CF0)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-text-primary truncate">{event.title}</p>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-pill ${isMine ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                        {isMine ? t("me") : t("partner")}
                      </span>
                    </div>
                    {event.start_time && <p className="text-[11px] text-text-muted">{event.start_time.slice(0, 5)}{event.end_time ? ` ~ ${event.end_time.slice(0, 5)}` : ""}</p>}
                  </div>
                  {isMine && (
                    <button onClick={() => handleDeleteEvent(event.id)}
                      className="opacity-60 active:opacity-100 p-1.5 rounded-full hover:bg-white/40 transition-all text-text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Places — with Naver Map link */}
      {places.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">{t("places")}</h3>
          <div className="space-y-2">
            {places.map((place) => (
              <div key={place.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-[16px] p-3 flex items-center gap-3 group">
                <span className="text-[10px] font-bold text-text-muted bg-white/30 px-1.5 py-0.5 rounded">{PLACE_LABEL[place.category] || PLACE_LABEL.etc}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{place.name}</p>
                  {place.note && <p className="text-[11px] text-text-muted">{place.note}</p>}
                </div>
                {/* Naver Map link */}
                <a href={naverMapUrl(place.name)} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full hover:bg-white/40 transition-all text-text-muted flex-shrink-0"
                  title={t("searchOnMap")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </a>
                <button onClick={() => handleDeletePlace(place.id)}
                  className="opacity-60 active:opacity-100 p-1.5 rounded-full hover:bg-white/40 transition-all text-text-muted flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Memo */}
      <section>
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
          {t("note")} {memoSaving && <span className="text-[10px] font-normal">({t("saving")})</span>}
        </h3>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={handleSaveMemo}
          placeholder={t("noteplaceholder")}
          rows={3}
          className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-[16px] text-sm text-text-primary placeholder:text-text-muted resize-none outline-none focus:border-primary/40 transition-colors"
        />
      </section>
    </div>
  );
}
