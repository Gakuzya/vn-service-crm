import React from "react";
import BookingWidget from "@/components/BookingWidget";
import LiveStationStatus from "@/components/LiveStationStatus";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Award,
  PhoneCall,
  LayoutDashboard,
  Wrench,
  CheckCircle2,
  MapPin,
  Camera,
  Send,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Cpu,
  Coffee,
  Car,
  Lock,
  Star,
  PackageCheck,
  CreditCard,
  QrCode,
  FileText
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-sky-500 selection:text-slate-950">
      {/* Фоновые неоновые подсветки VN SERVICE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Верхняя информационная полоса (Top Bar) */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 py-2 px-4 hidden sm:block relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              г. Астана, район Байконыр, пр. Акжол, 52/1
            </span>
            <LiveStationStatus />
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://2gis.kz/astana/search/VN%20SERVICE"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Рейтинг 4.9 в 2ГИС
            </a>
            <span className="text-slate-700">|</span>
            <Link
              href="/admin"
              className="text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <Lock className="w-3 h-3 text-sky-400" /> Вход для мастеров
            </Link>
          </div>
        </div>
      </div>

      {/* Навигационная панель VN SERVICE */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-sky-500/25 tracking-wider">
              VN
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                VN <span className="text-sky-400">SERVICE</span>
              </div>
              <span className="text-[10px] text-slate-400 block tracking-wider uppercase -mt-1 font-mono">
                Автосервис полного цикла • Астана
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#booking" className="hover:text-sky-400 transition-colors">
              Онлайн-запись
            </a>
            <a href="#services" className="hover:text-sky-400 transition-colors">
              Услуги и цены (₸)
            </a>
            <a href="#parts" className="hover:text-sky-400 transition-colors">
              Склад запчастей
            </a>
            <a href="#team" className="hover:text-sky-400 transition-colors">
              Мастера
            </a>
            <a href="#contacts" className="hover:text-sky-400 transition-colors">
              Контакты
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+77715348656"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white hover:text-sky-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
              +7 (771) 534-86-56
            </a>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>CRM Мастера</span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO СЕКЦИЯ С АКТУАЛЬНЫМИ АКЦИЯМИ И ВИДЖЕТОМ ЗАПИСИ
      ========================================================================= */}
      <section id="booking" className="relative z-10 pt-10 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            {/* Бейдж официальной акции VN SERVICE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-transparent border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-md shadow-emerald-500/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Акция в Астане: Диагностика ходовой — 0 ₸ при записи до 12:00
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Профессиональный автосервис в Астане{" "}
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
                «VN SERVICE»
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Диагностика и ремонт любой сложности за 1 визит. Собственный склад автозапчастей,
              фотофиксация поломок в Telegram и полная прозрачность расчетов.
            </p>

            {/* Метки доверия */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Запчасти на месте
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kaspi QR / Рассрочка
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Документы с НДС для юрлиц
              </span>
            </div>
          </div>

          {/* Клиентский виджет онлайн-записи VN SERVICE */}
          <BookingWidget />
        </div>
      </section>

      {/* =========================================================================
          СЕКЦИЯ: ПОПУЛЯРНЫЕ УСЛУГИ И ПРАЙС-ЛИСТ (₸)
      ========================================================================= */}
      <section id="services" className="py-16 px-4 bg-slate-900/40 border-t border-b border-slate-800/80 relative z-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Прайс-лист VN SERVICE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Популярные услуги автосервиса
            </h2>
            <p className="text-xs text-slate-400">
              Фиксированная стоимость в тенге без скрытых доплат. Оплата после проверки авто
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Диагностика ходовой части",
                price: "0 ₸",
                origPrice: "4 000 ₸",
                time: "45 минут",
                desc: "Осмотр на подъемнике: сайлентблоки, амортизаторы, рычаги, шаровые, рулевые тяги и тормоза.",
                badge: "Бесплатно до 12:00",
                badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
              },
              {
                title: "Компьютерная диагностика ЭБУ",
                price: "7 000 ₸",
                origPrice: null,
                time: "45 минут",
                desc: "Глубокое сканирование дилерским сканером, чтение и сброс ошибок Check Engine, ABS, ESP, датчиков.",
                badge: "Хит",
                badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
              },
              {
                title: "Замена масла и фильтров",
                price: "4 500 ₸",
                origPrice: null,
                time: "45 минут",
                desc: "Аппаратная или классическая замена моторного масла, замена фильтров, проверка уровней техжидкостей.",
                badge: "Экспресс",
                badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
              },
              {
                title: "Ремонт ходовой и рулевой",
                price: "12 000 ₸",
                origPrice: null,
                time: "90 минут",
                desc: "Замена сайлентблоков на гидравлическом прессе, рычагов, наконечников, втулок и стоек стабилизатора.",
                badge: null,
                badgeColor: "",
              },
              {
                title: "Замена тормозных колодок",
                price: "6 000 ₸",
                origPrice: null,
                time: "60 минут",
                desc: "Снятие суппорта, очистка скоб, нанесение термостойкой смазки на направляющие, замена колодок.",
                badge: null,
                badgeColor: "",
              },
              {
                title: "Заправка автокондиционера",
                price: "12 000 ₸",
                origPrice: null,
                time: "60 минут",
                desc: "Вакуумирование системы, проверка на герметичность, заправка качественным фреоном R134a и маслом.",
                badge: "Сезон",
                badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
              },
            ].map((srv, i) => (
              <div
                key={i}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-400/60 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-sky-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-sky-400 font-mono flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> {srv.time}
                    </span>
                    {srv.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${srv.badgeColor}`}>
                        {srv.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Стоимость:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {srv.price}
                      </span>
                      {srv.origPrice && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          {srv.origPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href="#booking"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 group-hover:bg-sky-500 group-hover:text-slate-950 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1"
                  >
                    Записаться <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          СЕКЦИЯ: СОБСТВЕННЫЙ СКЛАД АВТОЗАПЧАСТЕЙ VN SERVICE
      ========================================================================= */}
      <section id="parts" className="py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Экономия вашего времени
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Свой склад автозапчастей:{" "}
              <span className="text-sky-400">ремонт за 1 визит</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Вам не нужно искать запчасти по всему городу или ждать доставки днями. В VN SERVICE
              работает собственный отдел снабжения — подбор по VIN-коду занимает 10 минут, а
              детали доставляются прямо в бокс к мастеру.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">В наличии более 5 000 позиций</h4>
                  <p className="text-[11px] text-slate-400">
                    Оригинальные масла, фильтры, колодки, рычаги, амортизаторы и свечи зажигания.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kaspi Red и Рассрочка 0-0-12</h4>
                  <p className="text-[11px] text-slate-400">
                    Оплачивайте запчасти и ремонт в удобную рассрочку через Kaspi QR без переплат.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Работаем с юрлицами (НДС)</h4>
                  <p className="text-[11px] text-slate-400">
                    Заключаем договоры на обслуживание корпоративных автопарков с актами выполненных работ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Плашка карточки склада */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  VN
                </div>
                <div>
                  <div className="text-sm font-bold text-white">VN PARTS Астана</div>
                  <div className="text-xs text-emerald-400 font-medium">Склад открыт</div>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">пр. Акжол, 52/1</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Марки авто:</span>
                <span className="font-semibold text-white">Toyota, Lexus, BMW, Hyundai, Kia, Chery, Haval, Geely</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Масла в бочках:</span>
                <span className="font-semibold text-white">Motul, Liqui Moly, Mobil 1, Shell</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Гарантия на детали:</span>
                <span className="font-semibold text-emerald-400">До 12 месяцев</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-center justify-between">
              <span>Нужна деталь прямо сейчас?</span>
              <a
                href="https://wa.me/77715348656"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-sky-400 hover:underline"
              >
                Написать в WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          СЕКЦИЯ: НАШИ МАСТЕРА
      ========================================================================= */}
      <section id="team" className="py-16 px-4 bg-slate-900/40 border-t border-slate-800/80 relative z-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
              Персонал сервиса
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Мастера СТО «VN SERVICE»
            </h2>
            <p className="text-xs text-slate-400">
              Опытные специалисты с профильным образованием и сертификатами производителей
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: "Руслан Касымов",
                role: "Старший диагност / Автоэлектрик",
                exp: "Стаж 12 лет",
                car: "Компьютерная диагностика дилерскими сканерами, сложная электрика",
              },
              {
                name: "Алишер Нурпеисов",
                role: "Моторист / ДВС и МКПП",
                exp: "Стаж 11 лет",
                car: "Капитальный ремонт двигателей, замена ГРМ, ремонт навесного",
              },
              {
                name: "Бахтияр Сыздыков",
                role: "Ходовая часть и тормоза",
                exp: "Стаж 8 лет",
                car: "Ремонт подвески, замена сайлентблоков, обслуживание суппортов",
              },
              {
                name: "Тимур Искаков",
                role: "Специалист по автоклимату и ТО",
                exp: "Стаж 9 лет",
                car: "Заправка кондиционеров, аппаратная замена техжидкостей",
              },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-sky-500/20">
                  {m.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{m.name}</h3>
                  <div className="text-xs text-sky-400 font-medium mt-0.5">{m.role}</div>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                    {m.exp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  {m.car}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          ПОДВАЛ И КОНТАКТЫ VN SERVICE
      ========================================================================= */}
      <footer id="contacts" className="border-t border-slate-800 bg-slate-950 py-12 px-4 relative z-10 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                VN
              </div>
              <span className="text-sm font-black text-white">VN SERVICE АСТАНА</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Автосервис полного цикла в городе Астана. Ремонт ДВС, ходовой, электрики и автоклимата.
              Собственный склад запчастей и гарантия качества.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Контакты СТО</h4>
            <div className="space-y-1.5 text-[11px]">
              <p className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" /> +7 (771) 534-86-56
              </p>
              <p className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" /> +7 (747) 291-18-00
              </p>
              <p className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-400" /> @VnServiceAstana_bot
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Адрес и режим</h4>
            <div className="space-y-1.5 text-[11px]">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                г. Астана, район Байконыр, пр. Акжол, 52/1
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Ежедневно: 09:00 – 20:00 (без выходных)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Служебная зона</h4>
            <p className="text-[11px] text-slate-400">
              Вход в CRM дашборд для мастеров-приемщиков и механиков VN SERVICE:
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Lock className="w-3 h-3" /> Панель мастера VN (PIN: 7777)
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
          <div>© {new Date().getFullYear()} СТО «VN SERVICE». Все права защищены. Казахстан, г. Астана, пр. Акжол, 52/1.</div>
          <div className="flex items-center gap-3">
            <span>Политика конфиденциальности</span>
            <span>•</span>
            <span>Договор публичной оферты</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
