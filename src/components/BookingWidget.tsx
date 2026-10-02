"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Car,
  Camera,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Send,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  X,
  UploadCloud,
  Loader2,
  MapPin,
  Clock3,
  Sparkles,
  Tag
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string | number;
}

interface StationInfo {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
}

interface SlotItem {
  time: string;
  slotStart: string;
  slotEnd: string;
  available: boolean;
  freeSlotsLeft: number;
}

export default function BookingWidget() {
  // Шаг мастера (1 - 5, 6 = Success)
  const [step, setStep] = useState<number>(1);

  // Состояние загрузки справочников
  const [loadingServices, setLoadingServices] = useState(true);
  const [station, setStation] = useState<StationInfo | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Форма записи
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carPlateNumber, setCarPlateNumber] = useState("");
  const [problemDesc, setProblemDesc] = useState("");

  // Фотографии
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Выбор даты и слота
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Контакты
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+7 (7");

  // Отправка формы
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [telegramLink, setTelegramLink] = useState<string>("");

  // Режим реального времени (Live polling статуса и таймер)
  const [liveAppointment, setLiveAppointment] = useState<any>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Таймер реального времени с момента подачи заявки
  useEffect(() => {
    if (step !== 6) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Опрос статуса заявки и привязки Telegram каждые 3 секунды
  useEffect(() => {
    if (step !== 6 || !createdAppointment?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/appointments/${createdAppointment.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.appointment) {
            setLiveAppointment(data.appointment);
          }
        }
      } catch (e) {
        // игнорируем сетевые сбои
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, createdAppointment]);

  // Загрузка услуг при монтировании
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const res = await fetch("/api/services");
        const data = await res.json();
        if (data.services) {
          setServices(data.services);
          setStation(data.station);
          if (data.services.length > 0) {
            setSelectedService(data.services[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // Загрузка слотов при смене даты или выбранной услуги
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    async function fetchSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const res = await fetch(
          `/api/slots?date=${selectedDate}&duration=${selectedService?.durationMinutes || 60}`
        );
        const data = await res.json();
        if (data.slots) {
          setSlots(data.slots);
        }
      } catch (err) {
        console.error("Ошибка загрузки слотов:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate, selectedService]);

  // Загрузка фото в Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photoUrls.length + files.length > 5) {
      setUploadError("Можно прикрепить не более 5 фотографий");
      return;
    }

    setUploadingPhoto(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Ошибка при загрузке фото");
        }

        if (data.url) {
          setPhotoUrls((prev) => [...prev, data.url]);
        }
      }
    } catch (err: any) {
      setUploadError(err.message || "Не удалось загрузить фото");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotoUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Валидация перехода на следующий шаг
  const canProceed = () => {
    if (step === 1) return selectedService !== null;
    if (step === 2) return carMake.trim().length > 0 && carModel.trim().length > 0;
    if (step === 3) return true;
    if (step === 4) return selectedSlot !== null;
    if (step === 5) return clientName.trim().length >= 2 && clientPhone.trim().length >= 10;
    return false;
  };

  // Финальная отправка записи
  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedSlot) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          stationId: station?.id,
          startTime: selectedSlot.slotStart,
          endTime: selectedSlot.slotEnd,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          carMake: carMake.trim(),
          carModel: carModel.trim(),
          carPlateNumber: carPlateNumber.trim(),
          problemDesc: problemDesc.trim(),
          photoUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось сохранить запись");
      }

      setCreatedAppointment(data.appointment);
      setTelegramLink(data.telegramLink);
      setStep(6);
    } catch (err: any) {
      setErrorMsg(err.message || "Произошла ошибка при отправке");
    } finally {
      setSubmitting(false);
    }
  };

  // Генерация ближайших 7 дней
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("ru-RU", { weekday: "short" });
    const dayNum = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    return { dateStr, dayName, dayNum, isToday: i === 0 };
  });

  return (
    <div id="booking-widget" className="w-full max-w-xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-sky-500/20 rounded-3xl shadow-2xl shadow-sky-950/40 overflow-hidden text-slate-100 transition-all">
      {/* Верхний брендовый баннер VN SERVICE */}
      <div className="relative p-6 bg-gradient-to-r from-sky-600/25 via-blue-600/10 to-amber-500/10 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-500/25 font-black text-white text-lg tracking-wider">
              VN
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                СТО «VN SERVICE»
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Астана • Акжол 52/1
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">г. Астана, район Байконыр, пр. Акжол, 52/1</span>
              </p>
            </div>
          </div>
        </div>

        {/* Индикатор шагов */}
        {step <= 5 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-sky-400">Шаг {step} из 5</span>
              <span className="font-medium text-slate-300">
                {step === 1 && "Выбор услуги"}
                {step === 2 && "Данные авто"}
                {step === 3 && "Фото поломки"}
                {step === 4 && "Выбор времени"}
                {step === 5 && "Контакты"}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 via-blue-500 to-amber-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Тело виджета */}
      <div className="p-6">
        {/* =========================================================================
            ШАГ 1: ВЫБОР УСЛУГИ (В ТЕНГЕ ₸)
        ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-sky-400" /> Выберите услугу
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Официальный прайс-лист VN SERVICE в тенге (₸)
                </p>
              </div>
            </div>

            {loadingServices ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                <span className="text-xs text-slate-400">Загрузка услуг VN SERVICE...</span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {services.map((item) => {
                  const isSelected = selectedService?.id === item.id;
                  const isFreePromo = Number(item.price) === 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedService(item)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-sky-500/15 border-sky-400 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/50"
                          : "bg-slate-800/50 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            {item.name}
                            {isFreePromo && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                АКЦИЯ
                              </span>
                            )}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 pt-1 text-xs text-slate-300">
                            <span className="flex items-center gap-1 text-sky-400 font-medium">
                              <Clock className="w-3.5 h-3.5" /> ~{item.durationMinutes} мин.
                            </span>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          {isFreePromo ? (
                            <div className="text-emerald-400 font-black text-sm">
                              0 ₸ <span className="text-[10px] text-slate-400 block font-normal">Бесплатно</span>
                            </div>
                          ) : (
                            <span className="text-base font-bold text-amber-400">
                              {Number(item.price).toLocaleString("ru-RU")} ₸
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ШАГ 2: ДАННЫЕ АВТОМОБИЛЯ И ОПИСАНИЕ
        ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-sky-400" /> Данные автомобиля
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Обслуживаем любые марки: от Toyota и BMW до современных брендов (Geely, Chery, Haval)
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Марка авто <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Например, Toyota"
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Модель <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Например, Prado 150"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Госномер (Астана / регион 01)
                </label>
                <input
                  type="text"
                  placeholder="010 VNN 01 или 777 AAA 01"
                  value={carPlateNumber}
                  onChange={(e) => setCarPlateNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Симптомы неисправности / Требуемые работы
                </label>
                <textarea
                  rows={3}
                  placeholder="Опишите, что беспокоит (стук в подвеске, ошибки на панели, замена расходников)..."
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ШАГ 3: ФОТОГРАФИИ ПОЛОМОК
        ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-400" /> Фото поломки или панели
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Прикрепите фото дефекта, индикаторов приборной панели или VIN-кода
              </p>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-sky-400/60 rounded-2xl cursor-pointer bg-slate-800/40 hover:bg-slate-800/80 transition-all group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto || photoUrls.length >= 5}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-sky-500/20 flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors mb-2">
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                {uploadingPhoto ? "Загрузка в VN Storage..." : "Нажмите или перетащите фото"}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                JPEG, PNG до 10 МБ (до 5 фотографий)
              </span>
            </label>

            {photoUrls.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400">
                  Прикреплено ({photoUrls.length}/5):
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {photoUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden aspect-video border border-slate-700 bg-slate-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ШАГ 4: ВЫБОР ДАТЫ И ВРЕМЕНИ
        ========================================================================= */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-400" /> Выберите дату и время
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                График постов VN SERVICE: 09:00 – 20:00 ежедневно без выходных
              </p>
            </div>

            {/* Быстрый выбор даты */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {next7Days.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-sky-500 border-sky-400 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                        : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      {d.isToday ? "Сегодня" : d.dayName}
                    </div>
                    <div className="text-xs font-semibold mt-0.5">{d.dayNum}</div>
                  </button>
                );
              })}
            </div>

            {/* Сетка слотов */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Свободные окна:</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock3 className="w-3 h-3 text-sky-400" /> Длительность:{" "}
                  {selectedService?.durationMinutes} мин.
                </span>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                  <span className="text-xs text-slate-400">Проверяем свободные подъемники...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/40 rounded-xl">
                  На этот день нет свободных окон
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.slotStart === slot.slotStart;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                          !slot.available
                            ? "bg-slate-800/20 border-slate-800/40 text-slate-600 line-through cursor-not-allowed"
                            : isSelected
                            ? "bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20 font-bold"
                            : "bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-sky-400/60 hover:bg-slate-800"
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ШАГ 5: КОНТАКТЫ И ИТОГ В ТЕНГЕ ₸
        ========================================================================= */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" /> Контактные данные
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Для бронирования подъемника и связи с мастером VN SERVICE
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ваше имя <span className="text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Арман"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Номер телефона (Казахстан) <span className="text-sky-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (771) 123-45-67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
                />
              </div>
            </div>

            {/* Карточка сводки записи */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
              <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1.5 flex justify-between items-center">
                <span>Итого к оплате:</span>
                <span className="text-amber-400 font-bold text-sm">
                  {Number(selectedService?.price) === 0
                    ? "0 ₸ (Акция)"
                    : `${Number(selectedService?.price).toLocaleString("ru-RU")} ₸`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Услуга:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Автомобиль:</span>
                <span className="font-medium">
                  {carMake} {carModel} {carPlateNumber && `(${carPlateNumber})`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Дата и время:</span>
                <span className="font-medium text-sky-400">
                  {selectedDate} в {selectedSlot?.time}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Адрес СТО:</span>
                <span className="font-medium text-slate-300">
                  г. Астана, пр. Акжол, 52/1
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ШАГ 6: УСПЕХ, REALTIME ТРЕКЕР И ПЕРЕХОД В TELEGRAM
        ========================================================================= */}
        {step === 6 && (
          <div className="py-4 text-center space-y-5 animate-in zoom-in-95 duration-400">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white">Вы успешно записаны в VN SERVICE!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Ждем вас{" "}
                <span className="text-sky-400 font-bold">
                  {selectedDate} в {selectedSlot?.time}
                </span>
                . Подъемник и мастер зарезервированы.
              </p>
            </div>

            {/* Блок Realtime отслеживания заявки в реальном времени */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 border border-sky-500/40 text-left text-xs space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                    Live статус в реальном времени
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  ⏱ {Math.floor(secondsElapsed / 60)} мин. {secondsElapsed % 60} сек. назад
                </span>
              </div>

              {/* Текущий статус ремонта */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Текущий статус:</span>
                <div>
                  {(() => {
                    const st = liveAppointment?.status || createdAppointment?.status || "PENDING";
                    if (st === "PENDING") {
                      return (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Ожидает подтверждения
                        </span>
                      );
                    }
                    if (st === "IN_PROGRESS") {
                      return (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          В работе на подъемнике
                        </span>
                      );
                    }
                    if (st === "WAITING_PARTS") {
                      return (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          Ждет запчасти со склада VN
                        </span>
                      );
                    }
                    if (st === "READY") {
                      return (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Готово к выдаче!
                        </span>
                      );
                    }
                    return (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        {st}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Статус привязки Telegram */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Telegram уведомления:</span>
                {liveAppointment?.telegramChatId ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Подключено (Chat #{liveAppointment.telegramChatId})
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Ожидает перехода в бота
                  </span>
                )}
              </div>
            </div>

            {/* Карточка визита */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Номер брони:</span>
                <span className="font-mono text-slate-200 font-bold">
                  #VN-{createdAppointment?.id?.slice(0, 6).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Автомобиль:</span>
                <span className="text-slate-200">
                  {carMake} {carModel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Стоимость:</span>
                <span className="text-amber-400 font-bold">
                  {Number(selectedService?.price) === 0
                    ? "0 ₸ (Бесплатно по акции)"
                    : `${Number(selectedService?.price).toLocaleString("ru-RU")} ₸`}
                </span>
              </div>
            </div>

            {/* Кнопка привязки Telegram */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/15 via-blue-600/10 to-transparent border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sky-400 text-xs font-semibold">
                <Send className="w-4 h-4" /> Telegram-бот VN SERVICE
              </div>
              <p className="text-[11px] text-slate-300">
                Подключите бота для получения фотоотчета ремонта, статуса готовности и напоминания:
              </p>
              <a
                href={telegramLink}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-4 h-4" /> Подключить Telegram-уведомления
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedSlot(null);
                setPhotoUrls([]);
                setLiveAppointment(null);
                setSecondsElapsed(0);
              }}
              className="text-xs text-slate-400 hover:text-white underline transition-colors"
            >
              Оформить еще одну запись
            </button>
          </div>
        )}

        {/* Нижние кнопки навигации (Шаги 1 - 5) */}
        {step <= 5 && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Назад
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep((s) => s + 1)}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  canProceed()
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                Далее <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canProceed() || submitting}
                onClick={handleBookingSubmit}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  canProceed() && !submitting
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Записываем...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Подтвердить запись
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
