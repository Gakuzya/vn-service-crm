import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const duration = parseInt(searchParams.get("duration") || "60", 10);
    const stationId = searchParams.get("stationId");

    if (!dateStr) {
      return NextResponse.json({ error: "Параметр date обязателен" }, { status: 400 });
    }

    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst();

    if (!station) {
      return NextResponse.json({ error: "СТО не найдена" }, { status: 404 });
    }

    // Получаем всех активных механиков
    const mechanics = await prisma.mechanic.findMany({
      where: { stationId: station.id, isActive: true },
    });

    const totalMechanics = mechanics.length || 1;

    // Временные границы дня строго по времени Астаны (UTC+5)
    const dayStart = new Date(`${dateStr}T00:00:00+05:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59+05:00`);

    // Существующие активные записи на этот день (не отмененные)
    const appointments = await prisma.appointment.findMany({
      where: {
        stationId: station.id,
        status: { not: "CANCELLED" },
        startTime: { gte: dayStart, lte: dayEnd },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        mechanicId: true,
      },
    });

    // Рабочее время СТО VN SERVICE: с 09:00 до 20:00
    const workStartHour = 9;
    const workEndHour = 20;
    const slots = [];
    const now = new Date();

    // Текущая дата и время в Астане (UTC+5)
    const astanaDateNow = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Almaty",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const astanaHour = parseInt(
      new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Asia/Almaty",
        hour: "2-digit",
        hour12: false,
      }).format(now),
      10
    );

    const astanaMinute = parseInt(
      new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Asia/Almaty",
        minute: "2-digit",
        hour12: false,
      }).format(now),
      10
    );

    const isToday = dateStr === astanaDateNow;

    for (let hour = workStartHour; hour < workEndHour; hour++) {
      for (const minute of [0, 30]) {
        const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        
        // Начало слота в часовом поясе Астаны (+05:00)
        const slotStart = new Date(`${dateStr}T${timeStr}:00+05:00`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        // Проверяем окончание до 20:00 по Астане
        const workEndTime = new Date(`${dateStr}T${workEndHour}:00:00+05:00`);
        if (slotEnd.getTime() > workEndTime.getTime()) {
          continue; // Услуга не успеет закончиться до закрытия в 20:00
        }

        // Проверка на прошедшее время с запасом 15 минут
        const isPast = slotStart.getTime() <= now.getTime() + 15 * 60 * 1000;

        // Сколько механиков занято в этом интервале
        const overlappingAppointments = appointments.filter((app) => {
          const appStart = new Date(app.startTime).getTime();
          const appEnd = new Date(app.endTime).getTime();
          return slotStart.getTime() < appEnd && slotEnd.getTime() > appStart;
        });

        const busyMechanicIds = new Set(
          overlappingAppointments.map((app) => app.mechanicId).filter(Boolean)
        );

        // Слот доступен, только если он не в прошлом и есть свободный мастер
        const isAvailable =
          !isPast &&
          overlappingAppointments.length < totalMechanics &&
          busyMechanicIds.size < totalMechanics;

        slots.push({
          time: timeStr,
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          available: isAvailable,
          isPast,
          freeSlotsLeft: Math.max(0, totalMechanics - overlappingAppointments.length),
        });
      }
    }

    const availableSlots = slots.filter((s) => s.available);
    const isStationClosed = astanaHour >= workEndHour || astanaHour < workStartHour;

    return NextResponse.json({
      slots,
      totalMechanics,
      meta: {
        astanaDateNow,
        astanaHour,
        astanaMinute,
        isToday,
        isStationClosed,
        availableSlotsCount: availableSlots.length,
        nextOpenText: isStationClosed
          ? (astanaHour < workStartHour ? "сегодня в 09:00" : "завтра в 09:00")
          : null,
      },
    });
  } catch (error) {
    console.error("Ошибка при расчете слотов:", error);
    return NextResponse.json({ error: "Ошибка сервера при расчете доступного времени" }, { status: 500 });
  }
}
