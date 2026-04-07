"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";

export default function FloatingAddButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const dateMatch = pathname.match(/\/date\/(\d{4}-\d{2}-\d{2})/);
  const dateStr = dateMatch ? dateMatch[1] : format(new Date(), "yyyy-MM-dd");

  const actions = [
    { label: "Schedule", tab: "schedule", angle: 180 },   // left
    { label: "Place", tab: "place", angle: 210 },          // left-up 30deg
    { label: "Photo", tab: "photo", angle: 250 },          // more up
  ];

  const handleAction = (tab: string) => {
    setOpen(false);
    if (tab === "photo") {
      router.push(`/date/${dateStr}`);
    } else {
      router.push(`/date/${dateStr}/add?tab=${tab}`);
    }
  };

  const distance = 80;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
      )}

      <div className="fixed bottom-5 right-4 z-[95]">
        {actions.map((action, i) => {
          const rad = (action.angle * Math.PI) / 180;
          const x = Math.cos(rad) * distance;
          const y = Math.sin(rad) * distance;

          return (
            <button
              key={action.tab}
              type="button"
              onClick={() => handleAction(action.tab)}
              className="absolute px-4 py-2 rounded-full text-[12px] font-bold text-white whitespace-nowrap transition-all duration-300 ease-out"
              style={{
                bottom: open ? -y : 0,
                right: open ? -x : 0,
                opacity: open ? 1 : 0,
                transform: open ? "scale(1)" : "scale(0.3)",
                pointerEvents: open ? "auto" : "none",
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)",
                boxShadow: "0 3px 10px rgba(255,107,138,0.35)",
              }}
            >
              {action.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-300"
          style={{
            background: "linear-gradient(135deg, #FF8BA7, #FF6B8A)",
            boxShadow: "0 6px 20px rgba(255,107,138,0.4)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );
}
