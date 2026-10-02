"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowLeft,
  LayoutDashboard,
  Clock,
  DollarSign,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Settings,
  Sparkles
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string | number;
  isActive: boolean;
}

interface Mechanic {
  id: string;
  name: string;
  specialty: string | null;
  isActive: boolean;
  _count?: { appointments: number };
}

export default function AdminSettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffPin, setStaffPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"services" | "mechanics">("services");

  // Услуги
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Форма услуги
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    durationMinutes: "60",
    price: "",
    isActive: true,
  });

  // Мастера
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);
  const [isMechanicModalOpen, setIsMechanicModalOpen] = useState(false);

  // Форма мастера
  const [mechanicForm, setMechanicForm] = useState({
    name: "",
    specialty: "",
    isActive: true,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Проверка сессии
  useEffect(() => {
    const savedPin = sessionStorage.getItem("nomad_staff_pin");
    if (savedPin) {
      setStaffPin(savedPin);
      setIsAuthenticated(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Авторизация
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    } catch {
      setAuthError("Ошибка сервера");
    } finally {
      setAuthLoading(false);
    }
  };

  // Загрузка услуг
  const fetchServices = async () => {
    if (!staffPin) return;
    setLoadingServices(true);
    try {
      const res = await fetch("/api/admin/services", {
        headers: { "x-staff-pin": staffPin },
      });
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingServices(false);
    }
  };

  // Загрузка мастеров
  const fetchMechanics = async () => {
    if (!staffPin) return;
    setLoadingMechanics(true);
    try {
      const res = await fetch("/api/admin/mechanics", {
        headers: { "x-staff-pin": staffPin },
      });
      const data = await res.json();
      if (data.mechanics) setMechanics(data.mechanics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMechanics(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
      fetchMechanics();
    }
  }, [isAuthenticated, staffPin]);

  // Сохранение услуги (Создание / Редактирование)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services";
      const method = editingService ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-staff-pin": staffPin,
        },
        body: JSON.stringify(serviceForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка сохранения");
        return;
      }

      showToast(
        editingService ? "Услуга успешно обновлена" : "Новая услуга добавлена в прейскурант"
      );
      setIsServiceModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Удаление услуги
  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Вы действительно хотите удалить или скрыть услугу «${name}»?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { "x-staff-pin": staffPin },
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Услуга удалена");
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Сохранение мастера
  const handleSaveMechanic = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingMechanic
        ? `/api/admin/mechanics/${editingMechanic.id}`
        : "/api/admin/mechanics";
      const method = editingMechanic ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-staff-pin": staffPin,
        },
        body: JSON.stringify(mechanicForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка сохранения");
        return;
      }

      showToast(
        editingMechanic
          ? "Данные мастера обновлены"
          : "Новый сотрудник добавлен в штат СТО"
      );
      setIsMechanicModalOpen(false);
      setEditingMechanic(null);
      fetchMechanics();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Удаление мастера
  const handleDeleteMechanic = async (id: string, name: string) => {
    if (!confirm(`Вы действительно хотите удалить или деактивировать сотрудника «${name}»?`)) return;

    try {
      const res = await fetch(`/api/admin/mechanics/${id}`, {
        method: "DELETE",
        headers: { "x-staff-pin": staffPin },
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Сотрудник удален");
        fetchMechanics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Экран ввода PIN-кода
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Кабинет владельца СТО</h2>
            <p className="text-xs text-slate-400">
              Введите PIN-код для управления прейскурантом цен и сотрудниками
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || pinInput.length < 4}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all"
            >
              {authLoading ? "Проверка..." : "Войти в настройки"}
            </button>
          </form>

          <div className="text-center">
            <Link href="/admin" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Вернуться в CRM дашборд
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast уведомление */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Шапка */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>К таймлайну CRM</span>
            </Link>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                VN
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">
                  Управление СТО «VN SERVICE»
                </h1>
                <p className="text-[10px] text-slate-400">
                  Прейскурант услуг в тенге (₸) и штат мастеров
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Открыть клиентский сайт ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* Переключатель вкладок: Услуги / Мастера */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "services"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Услуги и цены (₸) ({services.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mechanics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "mechanics"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Сотрудники и мастера ({mechanics.length})</span>
            </button>
          </div>

          {activeTab === "services" ? (
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setServiceForm({
                  name: "",
                  description: "",
                  durationMinutes: "60",
                  price: "",
                  isActive: true,
                });
                setIsServiceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Добавить услугу
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingMechanic(null);
                setMechanicForm({
                  name: "",
                  specialty: "",
                  isActive: true,
                });
                setIsMechanicModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Добавить сотрудника
            </button>
          )}
        </div>

        {/* =========================================================================
            ВКЛАДКА 1: УСЛУГИ И ЦЕНЫ (₸)
        ========================================================================= */}
        {activeTab === "services" && (
          <div className="space-y-4">
            {loadingServices ? (
              <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                <span>Загрузка прейскуранта...</span>
              </div>
            ) : services.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                Нет добавленных услуг. Нажмите «Добавить услугу», чтобы начать.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                      s.isActive
                        ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                        : "bg-slate-900/40 border-slate-800/40 opacity-60"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-sky-400 flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" /> ~{s.durationMinutes} мин.
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            s.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {s.isActive ? "Активна на сайте" : "Скрыта"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{s.name}</h3>

                      {s.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Стоимость:</span>
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {Number(s.price).toLocaleString("ru-RU")} ₸
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(s);
                            setServiceForm({
                              name: s.name,
                              description: s.description || "",
                              durationMinutes: String(s.durationMinutes),
                              price: String(s.price),
                              isActive: s.isActive,
                            });
                            setIsServiceModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteService(s.id, s.name)}
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                          title="Удалить / скрыть"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ВКЛАДКА 2: СОТРУДНИКИ И МАСТЕРА СТО
        ========================================================================= */}
        {activeTab === "mechanics" && (
          <div className="space-y-4">
            {loadingMechanics ? (
              <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                <span>Загрузка сотрудников...</span>
              </div>
            ) : mechanics.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                Нет добавленных мастеров. Нажмите «Добавить сотрудника».
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mechanics.map((m) => (
                  <div
                    key={m.id}
                    className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
                      m.isActive
                        ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                        : "bg-slate-900/40 border-slate-800/40 opacity-60"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-sky-500/20">
                          {m.name[0]}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            m.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {m.isActive ? "В смене" : "В отпуске"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">{m.name}</h3>
                        <p className="text-xs text-sky-400 font-medium mt-0.5">
                          {m.specialty || "Мастер СТО"}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        Выполнено визитов: <span className="text-white font-bold">{m._count?.appointments || 0}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMechanic(m);
                          setMechanicForm({
                            name: m.name,
                            specialty: m.specialty || "",
                            isActive: m.isActive,
                          });
                          setIsMechanicModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMechanic(m.id, m.name)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          МОДАЛКА: СОЗДАНИЕ / РЕДАКТИРОВАНИЕ УСЛУГИ
      ========================================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                {editingService ? "Редактирование услуги" : "Новая услуга СТО"}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Название услуги <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например, Замена радиатора охлаждения"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Стоимость в тенге (₸) <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Длительность (в минутах) <span className="text-sky-400">*</span>
                  </label>
                  <select
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="30">30 минут</option>
                    <option value="45">45 минут</option>
                    <option value="60">60 минут (1 час)</option>
                    <option value="90">90 минут (1.5 часа)</option>
                    <option value="120">120 минут (2 часа)</option>
                    <option value="180">180 минут (3 часа)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Описание услуги (для клиента на сайте)
                </label>
                <textarea
                  rows={3}
                  placeholder="Опишите, что входит в работу (слив антифриза, снятие бампера, установка)..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="serviceActive"
                  checked={serviceForm.isActive}
                  onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
                <label htmlFor="serviceActive" className="text-xs text-slate-300 cursor-pointer">
                  Отображать услугу в онлайн-виджете записи на сайте
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20"
                >
                  {actionLoading ? "Сохранение..." : editingService ? "Сохранить изменения" : "Добавить услугу"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          МОДАЛКА: СОЗДАНИЕ / РЕДАКТИРОВАНИЕ МАСТЕРА
      ========================================================================= */}
      {isMechanicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                {editingMechanic ? "Редактирование сотрудника" : "Новый сотрудник СТО"}
              </h3>
              <button
                onClick={() => setIsMechanicModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMechanic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ФИО сотрудника <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например, Ержан Касымов"
                  value={mechanicForm.name}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Специализация мастера
                </label>
                <input
                  type="text"
                  placeholder="Например, Моторист / Ремонт ДВС и агрегатов"
                  value={mechanicForm.specialty}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, specialty: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mechanicActive"
                  checked={mechanicForm.isActive}
                  onChange={(e) => setMechanicForm({ ...mechanicForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
                <label htmlFor="mechanicActive" className="text-xs text-slate-300 cursor-pointer">
                  Активен на смене (учитывать в таймлайне и онлайн-записи)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMechanicModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20"
                >
                  {actionLoading ? "Сохранение..." : editingMechanic ? "Сохранить изменения" : "Добавить сотрудника"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
