"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Calendar,
  LayoutDashboard,
  Clock,
  Car,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Columns,
  GanttChart,
  ArrowLeft,
  CheckCircle2,
  Users,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Settings
} from "lucide-react";
import AdminTimeline from "@/components/AdminTimeline";
import AdminKanban from "@/components/AdminKanban";
import AppointmentDetailModal from "@/components/AppointmentDetailModal";

export default function AdminPage() {
  // Авторизация сотрудника СТО
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffPin, setStaffPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Состояние CRM
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [viewMode, setViewMode] = useState<"timeline" | "kanban">("timeline");
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<any>(null);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    inProgress: 0,
    waitingParts: 0,
    ready: 0,
    completed: 0,
    totalRevenue: 0,
  });

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Проверка сохраненной сессии сотрудника
  useEffect(() => {
    const savedPin = sessionStorage.getItem("nomad_staff_pin");
    if (savedPin) {
      setStaffPin(savedPin);
      setIsAuthenticated(true);
    }
  }, []);

  // Авторизация по PIN-коду
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.length < 4) {
      setAuthError("Введите 4-значный PIN-код");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Неверный PIN-код");
        return;
      }

      setStaffPin(pinInput);
      setIsAuthenticated(true);
      sessionStorage.setItem("nomad_staff_pin", pinInput);
    } catch (err: any) {
      setAuthError("Ошибка сервера авторизации");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStaffPin("");
    setPinInput("");
    sessionStorage.removeItem("nomad_staff_pin");
  };

  // Загрузка данных для CRM (с поддержкой тихого обновления в реальном времени)
  const fetchCrmData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch(`/api/admin/appointments?date=${selectedDate}`);
      const data = await res.json();
      if (data.appointments) {
        setStation(data.station);
        setMechanics(data.mechanics || []);
        setAppointments(data.appointments || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Ошибка загрузки данных CRM:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmData();

    // Автоматическая Real-time синхронизация каждые 4 секунды
    const liveInterval = setInterval(() => {
      fetchCrmData(true);
    }, 4000);

    return () => clearInterval(liveInterval);
  }, [selectedDate]);

  // Быстрая смена даты
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Обновление записи в локальном состоянии
  const handleAppointmentUpdated = (updated: any) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === updated.id ? updated : app))
    );
    if (selectedAppointment?.id === updated.id) {
      setSelectedAppointment(updated);
    }
    fetchCrmData();
  };

  // Быстрая смена статуса с передачей staff-pin
  const handleQuickStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-pin": staffPin,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка доступа. Только сотрудники могут менять статус.");
        return;
      }
      if (data.success) {
        handleAppointmentUpdated(data.appointment);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================================
  // ЭКРАН АВТОРИЗАЦИИ СОТРУДНИКА СТО (ЗАЩИТА ОТ КЛИЕНТОВ)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Фоновые подсветки */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Вход для персонала VN SERVICE</h2>
            <p className="text-xs text-slate-400">
              Управление заказ-нарядами и диаграммой Ганта СТО «VN SERVICE» (г. Астана, пр. Акжол, 52/1)
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                Введите PIN-код сотрудника
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || pinInput.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Проверка доступа...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Войти в CRM
                </>
              )}
            </button>
          </form>

          {/* Подсказка для презентации/теста */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <span className="text-[11px] text-slate-400 block font-medium">
              Демо-доступ для администратора и мастеров:
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
              PIN: 7777
            </span>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Вернуться на сайт автосервиса
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ОСНОВНОЙ ДАШБОРД CRM АВТОРИЗОВАННОГО СОТРУДНИКА
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Верхний бар навигации администратора */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Клиентский сайт</span>
            </Link>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-black text-xs">
                VN
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">
                  CRM СТО «VN SERVICE»
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Мастер-приемщик • Астана, Акжол 52/1
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE РЕАЛЬНОЕ ВРЕМЯ (4с)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Управление датой, обновление и кнопка выхода */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setQuickDate(-1)}
                className="px-2.5 py-1 rounded-lg hover:text-white text-slate-400 transition-colors"
              >
                Вчера
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-sm"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-2.5 py-1 rounded-lg hover:text-white text-slate-400 transition-colors"
              >
                Завтра
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <Link
              href="/admin/settings"
              title="Управление услугами, ценами и персоналом"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Услуги и Мастера</span>
            </Link>

            <button
              type="button"
              onClick={() => fetchCrmData(false)}
              title="Обновить данные"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Завершить смену"
              className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Основная рабочая область */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* KPI карточки статистики на день (в тенге ₸) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* Всего авто */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Всего визитов</span>
              <div className="text-2xl font-black text-white mt-0.5">{stats.total || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Car className="w-5 h-5" />
            </div>
          </div>

          {/* В работе */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-400 font-medium">В боксах (в работе)</span>
              <div className="text-2xl font-black text-indigo-400 mt-0.5">{stats.inProgress || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          {/* Ждут запчасти */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-400 font-medium">Ждут запчасти</span>
              <div className="text-2xl font-black text-rose-400 mt-0.5">{stats.waitingParts || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Готовы к выдаче */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400 font-medium">Готовы к выдаче</span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{stats.ready || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Выручка в тенге */}
          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-400 font-medium">План выручки (тенге ₸)</span>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {Number(stats.totalRevenue || 0).toLocaleString("ru-RU")} ₸
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Переключатель вида: Таймлайн (Гант) / Канбан */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "timeline"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GanttChart className="w-4 h-4" />
              <span>Таймлайн постов (Гант)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Канбан-доска</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Мастеров на смене: {mechanics.length}</span>
          </div>
        </div>

        {/* Контент: Диаграмма Ганта или Канбан */}
        {viewMode === "timeline" ? (
          <AdminTimeline
            mechanics={mechanics}
            appointments={appointments}
            selectedDate={selectedDate}
            onSelectAppointment={(app) => setSelectedAppointment(app)}
          />
        ) : (
          <AdminKanban
            appointments={appointments}
            onSelectAppointment={(app) => setSelectedAppointment(app)}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}
      </main>

      {/* Модальное окно деталей визита */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          mechanics={mechanics}
          staffPin={staffPin}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleAppointmentUpdated}
        />
      )}
    </div>
  );
}
