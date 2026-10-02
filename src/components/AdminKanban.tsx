"use client";

import React from "react";
import {
  Car,
  Clock,
  Wrench,
  Camera,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface AdminKanbanProps {
  appointments: any[];
  onSelectAppointment: (appointment: any) => void;
  onQuickStatusChange: (appointmentId: string, newStatus: string) => void;
}

const COLUMNS = [
  {
    id: "PENDING_COL",
    title: "Ожидается",
    statuses: ["PENDING", "CONFIRMED"],
    headerBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    nextStatus: "IN_PROGRESS",
    nextLabel: "В работу",
  },
  {
    id: "IN_PROGRESS_COL",
    title: "В работе (на посте)",
    statuses: ["IN_PROGRESS"],
    headerBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    nextStatus: "READY",
    nextLabel: "Готово",
  },
  {
    id: "WAITING_PARTS_COL",
    title: "Ждет запчасти",
    statuses: ["WAITING_PARTS"],
    headerBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    nextStatus: "IN_PROGRESS",
    nextLabel: "Вернуть в работу",
  },
  {
    id: "READY_COL",
    title: "Готово к выдаче",
    statuses: ["READY"],
    headerBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    nextStatus: "COMPLETED",
    nextLabel: "Выдать и закрыть",
  },
  {
    id: "COMPLETED_COL",
    title: "Завершено",
    statuses: ["COMPLETED"],
    headerBg: "bg-slate-800 text-slate-400 border-slate-700",
    nextStatus: null,
    nextLabel: null,
  },
];

export default function AdminKanban({
  appointments,
  onSelectAppointment,
  onQuickStatusChange,
}: AdminKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colAppointments = appointments.filter((app) =>
          col.statuses.includes(app.status)
        );

        return (
          <div
            key={col.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3 flex flex-col min-w-[260px] h-[680px]"
          >
            {/* Заголовок колонки */}
            <div
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-between mb-3 ${col.headerBg}`}
            >
              <span>{col.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[11px] font-mono">
                {colAppointments.length}
              </span>
            </div>

            {/* Карточки в колонке */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {colAppointments.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-2xl">
                  Нет авто в этом статусе
                </div>
              ) : (
                colAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div
                      onClick={() => onSelectAppointment(app)}
                      className="cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            {app.carMake} {app.carModel}
                          </div>
                          {app.carPlateNumber && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {app.carPlateNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {Number(app.service?.price || 0).toLocaleString("ru-RU")} ₸
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-medium line-clamp-1">
                        {app.service?.name}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {new Date(app.startTime).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {app.photoUrls && app.photoUrls.length > 0 && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Camera className="w-3 h-3" /> {app.photoUrls.length} фото
                          </span>
                        )}
                      </div>

                      {app.mechanic ? (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                          <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{app.mechanic.name}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Мастер не назначен</span>
                        </div>
                      )}
                    </div>

                    {/* Быстрая смена статуса для сотрудника */}
                    {col.nextStatus && (
                      <button
                        type="button"
                        onClick={() => onQuickStatusChange(app.id, col.nextStatus!)}
                        className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-slate-700/60 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{col.nextLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
