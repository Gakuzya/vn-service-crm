"use client";

import React from "react";
import { User, Wrench, AlertCircle, Clock } from "lucide-react";

interface AdminTimelineProps {
  mechanics: any[];
  appointments: any[];
  selectedDate: string;
  onSelectAppointment: (appointment: any) => void;
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const TOTAL_MINUTES = 11 * 60; // 09:00 - 20:00 = 660 минут

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  PENDING: { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-300" },
  CONFIRMED: { bg: "bg-sky-500/20", border: "border-sky-500/50", text: "text-sky-300" },
  IN_PROGRESS: { bg: "bg-indigo-500/25", border: "border-indigo-500/60", text: "text-indigo-200" },
  WAITING_PARTS: { bg: "bg-rose-500/20", border: "border-rose-500/50", text: "text-rose-300" },
  READY: { bg: "bg-emerald-500/25", border: "border-emerald-500/60", text: "text-emerald-300" },
  COMPLETED: { bg: "bg-slate-700/40", border: "border-slate-600", text: "text-slate-400" },
  CANCELLED: { bg: "bg-zinc-800/30", border: "border-zinc-800", text: "text-zinc-600" },
};

export default function AdminTimeline({
  mechanics,
  appointments,
  selectedDate,
  onSelectAppointment,
}: AdminTimelineProps) {
  // Рассчитываем координаты блока на шкале времени (09:00 - 20:00)
  const calculatePosition = (startTimeStr: string, endTimeStr: string) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);

    const startMinutes = (start.getUTCHours() - 9) * 60 + start.getUTCMinutes();
    const durationMinutes = Math.max(30, (end.getTime() - start.getTime()) / (60 * 1000));

    const left = Math.max(0, Math.min(100, (startMinutes / TOTAL_MINUTES) * 100));
    const width = Math.max(4, Math.min(100 - left, (durationMinutes / TOTAL_MINUTES) * 100));

    return { left: `${left}%`, width: `${width}%` };
  };

  // Нераспределенные записи (без мастера)
  const unassignedAppointments = appointments.filter(
    (app) => !app.mechanicId && app.status !== "CANCELLED"
  );

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Шапка таймлайна */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">
            Диаграмма Ганта загруженности постов VN SERVICE (график 09:00 – 20:00)
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Все расчеты в тенге (₸)
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[850px] p-4">
          {/* Временная шкала (09:00 - 20:00) */}
          <div className="flex pl-48 border-b border-slate-800 pb-2 mb-2">
            {HOURS.slice(0, -1).map((hour) => (
              <div key={hour} className="flex-1 text-xs font-mono text-slate-400 pl-1 border-l border-slate-800/80">
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Строка «Нераспределенные записи» (если есть) */}
          {unassignedAppointments.length > 0 && (
            <div className="flex items-center mb-3 pb-3 border-b border-slate-800/80 group">
              <div className="w-48 shrink-0 pr-4">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>Не назначены ({unassignedAppointments.length})</span>
                </div>
                <span className="text-[10px] text-slate-400">Требуется выбрать мастера</span>
              </div>

              <div className="flex-1 relative h-14 bg-rose-950/20 border border-dashed border-rose-900/50 rounded-2xl p-1">
                {/* Вертикальные линии часов */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {HOURS.slice(0, -1).map((h) => (
                    <div key={h} className="flex-1 border-r border-slate-800/30" />
                  ))}
                </div>

                {/* Блоки записей */}
                {unassignedAppointments.map((app) => {
                  const pos = calculatePosition(app.startTime, app.endTime);
                  return (
                    <div
                      key={app.id}
                      onClick={() => onSelectAppointment(app)}
                      style={{ left: pos.left, width: pos.width }}
                      className="absolute top-1.5 bottom-1.5 rounded-xl border border-rose-500 bg-rose-500/20 text-rose-200 p-2 cursor-pointer shadow-lg hover:scale-[1.02] hover:z-20 transition-all flex flex-col justify-center overflow-hidden"
                    >
                      <div className="text-[11px] font-bold truncate flex justify-between items-center">
                        <span>{app.carMake} {app.carModel}</span>
                        <span className="font-mono text-[10px] text-amber-300 font-black">
                          {Number(app.service?.price || 0).toLocaleString("ru-RU")} ₸
                        </span>
                      </div>
                      <div className="text-[9px] text-rose-300 truncate">
                        {app.clientName} • {app.service?.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Строки каждого механика */}
          <div className="space-y-3">
            {mechanics.map((mechanic) => {
              const mechanicAppointments = appointments.filter(
                (app) => app.mechanicId === mechanic.id && app.status !== "CANCELLED"
              );

              return (
                <div key={mechanic.id} className="flex items-center group">
                  {/* Имя и специализация мастера */}
                  <div className="w-48 shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 text-xs font-bold">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate">
                          {mechanic.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {mechanic.specialty || "Мастер"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Таймлайн трек мастера */}
                  <div className="flex-1 relative h-14 bg-slate-800/40 border border-slate-800 rounded-2xl p-1 overflow-hidden">
                    {/* Фоновые разделители часов */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {HOURS.slice(0, -1).map((h) => (
                        <div key={h} className="flex-1 border-r border-slate-800/50" />
                      ))}
                    </div>

                    {/* Записи механика */}
                    {mechanicAppointments.map((app) => {
                      const pos = calculatePosition(app.startTime, app.endTime);
                      const style = STATUS_COLORS[app.status] || STATUS_COLORS.PENDING;

                      return (
                        <div
                          key={app.id}
                          onClick={() => onSelectAppointment(app)}
                          style={{ left: pos.left, width: pos.width }}
                          className={`absolute top-1.5 bottom-1.5 rounded-xl border ${style.border} ${style.bg} ${style.text} p-2 cursor-pointer shadow-md hover:scale-[1.02] hover:z-20 transition-all flex flex-col justify-center overflow-hidden`}
                        >
                          <div className="text-[11px] font-bold truncate flex justify-between items-center">
                            <span>{app.carMake} {app.carModel}</span>
                            <span className="font-mono text-[10px] font-black text-amber-300 ml-1">
                              {Number(app.service?.price || 0) === 0
                                ? "0 ₸"
                                : `${Number(app.service?.price || 0).toLocaleString("ru-RU")} ₸`}
                            </span>
                          </div>
                          <div className="text-[9px] opacity-80 truncate">
                            {app.service?.name} • {new Date(app.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
