"use client";

import React, { useState, useEffect } from "react";
import { Clock, Moon } from "lucide-react";

export default function LiveStationStatus() {
  const [status, setStatus] = useState<{ isOpen: boolean; text: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = parseInt(
        new Intl.DateTimeFormat("ru-RU", {
          timeZone: "Asia/Almaty",
          hour: "2-digit",
          hour12: false,
        }).format(now),
        10
      );

      if (hour >= 9 && hour < 20) {
        setStatus({
          isOpen: true,
          text: "Открыто сейчас (до 20:00)",
        });
      } else {
        const nextOpen = hour < 9 ? "сегодня в 09:00" : "завтра в 09:00";
        setStatus({
          isOpen: false,
          text: `Закрыто • Откроемся ${nextOpen}`,
        });
      }
    };

    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!status) {
    return (
      <span className="flex items-center gap-1.5 text-slate-400">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        Ежедневно: 09:00 – 20:00 (без выходных)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-slate-400">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        09:00 – 20:00
      </span>
      <span className="text-slate-700">•</span>
      {status.isOpen ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {status.text}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Moon className="w-3 h-3 text-amber-400" />
          {status.text}
        </span>
      )}
    </div>
  );
}
