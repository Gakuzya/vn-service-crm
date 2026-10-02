"use client";

import React, { useState } from "react";
import {
  X,
  Car,
  User,
  Phone,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  ExternalLink,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Lock
} from "lucide-react";

interface AppointmentDetailModalProps {
  appointment: any;
  mechanics: any[];
  staffPin: string;
  onClose: () => void;
  onUpdate: (updatedAppointment: any) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Ожидает подтверждения", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
  CONFIRMED: { label: "Подтвержден", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
  IN_PROGRESS: { label: "В работе (на посте)", color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30" },
  WAITING_PARTS: { label: "Ждет запчасти", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30" },
  READY: { label: "Готово к выдаче", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  COMPLETED: { label: "Завершен и выдан", color: "text-slate-400", bg: "bg-slate-800 border-slate-700" },
  CANCELLED: { label: "Отменен", color: "text-zinc-500", bg: "bg-zinc-800/40 border-zinc-800" },
};

export default function AppointmentDetailModal({
  appointment,
  mechanics,
  staffPin,
  onClose,
  onUpdate,
}: AppointmentDetailModalProps) {
  const [currentStatus, setCurrentStatus] = useState(appointment.status);
  const [currentMechanicId, setCurrentMechanicId] = useState(appointment.mechanicId || "");
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-pin": staffPin,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Ошибка доступа. Только сотрудники могут менять статус.");
        return;
      }
      if (data.success) {
        setCurrentStatus(newStatus);
        onUpdate(data.appointment);
      }
    } catch (err: any) {
      setAuthError(err.message || "Сетевая ошибка при смене статуса");
    } finally {
      setSaving(false);
    }
  };

  const handleMechanicChange = async (newMechanicId: string) => {
    setSaving(true);
    setAuthError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-pin": staffPin,
        },
        body: JSON.stringify({ mechanicId: newMechanicId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Ошибка доступа.");
        return;
      }
      if (data.success) {
        setCurrentMechanicId(newMechanicId);
        onUpdate(data.appointment);
      }
    } catch (err: any) {
      setAuthError(err.message || "Ошибка при назначении мастера");
    } finally {
      setSaving(false);
    }
  };

  const startTimeStr = new Date(appointment.startTime).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTimeStr = new Date(appointment.endTime).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
        {/* Заголовок модального окна */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {appointment.carMake} {appointment.carModel}
                </h3>
                {appointment.carPlateNumber && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200">
                    {appointment.carPlateNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Заказ-наряд #{appointment.id.slice(0, 8).toUpperCase()} • {startTimeStr} – {endTimeStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело карточки визита */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Предупреждение об ошибке авторизации */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Быстрое управление статусом (Pipeline) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Статус визита (только для сотрудников)
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Доступ авторизован
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "PENDING", label: "Ожидается" },
                { key: "IN_PROGRESS", label: "В работе" },
                { key: "WAITING_PARTS", label: "Ждет запчасти" },
                { key: "READY", label: "Готово к выдаче" },
                { key: "COMPLETED", label: "Завершен" },
              ].map((s) => {
                const isActive = currentStatus === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={saving}
                    onClick={() => handleStatusChange(s.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isActive
                        ? `${STATUS_LABELS[s.key]?.bg || "bg-amber-500"} ${STATUS_LABELS[s.key]?.color || "text-white"} ring-1 ring-amber-500/50`
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Информационные блоки (2 колонки) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Клиент */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" /> Клиент
              </span>
              <div className="text-sm font-bold text-white">{appointment.clientName}</div>
              <a
                href={`tel:${appointment.clientPhone}`}
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 mt-1 font-mono"
              >
                <Phone className="w-3 h-3" /> {appointment.clientPhone}
              </a>
              <div className="pt-2 flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    appointment.telegramChatId
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  <Send className="w-2.5 h-2.5 inline mr-1" />
                  {appointment.telegramChatId ? "Telegram подключен" : "Telegram не привязан"}
                </span>
              </div>
            </div>

            {/* Назначенный механик и услуга */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" /> Назначенный мастер СТО
              </span>
              <select
                value={currentMechanicId}
                onChange={(e) => handleMechanicChange(e.target.value)}
                disabled={saving}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Не назначен</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.specialty || "Мастер"})
                  </option>
                ))}
              </select>

              <div className="pt-1.5">
                <span className="text-xs text-slate-400">Услуга:</span>
                <div className="text-xs font-semibold text-white mt-0.5">
                  {appointment.service?.name}
                </div>
                <div className="text-xs text-amber-400 font-bold mt-1">
                  {Number(appointment.service?.price || 0).toLocaleString("ru-RU")} ₸ (~{appointment.service?.durationMinutes} мин.)
                </div>
              </div>
            </div>
          </div>

          {/* Описание проблемы со слов клиента */}
          {appointment.problemDesc && (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Описание проблемы со слов клиента:</span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                «{appointment.problemDesc}»
              </p>
            </div>
          )}

          {/* Фотографии поломок (Supabase Storage) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              Фото поломки ({appointment.photoUrls?.length || 0})
            </span>

            {appointment.photoUrls && appointment.photoUrls.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {appointment.photoUrls.map((url: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPhoto(url)}
                    className="relative group rounded-xl overflow-hidden aspect-video border border-slate-700 bg-slate-800 cursor-pointer hover:border-amber-500 transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                Клиент не прикрепил фотографии поломки.
              </p>
            )}
          </div>
        </div>

        {/* Подвал с кнопкой закрытия */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {saving && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Сохранение изменений...</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Закрыть
          </button>
        </div>

        {/* Лайтбокс для просмотра фото на весь экран */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Увеличенное фото поломки"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
