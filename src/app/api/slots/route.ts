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

    // Временные границы дня (от 09:00 до 20:00)
    const [year, month, day] = dateStr.split("-").map(Number);
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    // Существующие записи на этот день (не отмененные)
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

    // Рабочее время: с 09:00 до 20:00 (шаг 30 минут)
    const workStartHour = 9;
    const workEndHour = 20;
    const slots = [];
    const now = new Date();

    for (let hour = workStartHour; hour < workEndHour; hour++) {
      for (const minute of [0, 30]) {
        // Проверяем, чтобы услуга успевала завершиться до конца рабочего дня
        const slotStart = new Date(Date.UTC(year, month - 1, day, hour, minute));
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        const slotEndHour = slotEnd.getUTCHours();
        const slotEndMinute = slotEnd.getUTCMinutes();
        if (slotEndHour > workEndHour || (slotEndHour === workEndHour && slotEndMinute > 0)) {
          continue; // Услуга не успеет закончиться до закрытия
        }

        // Проверка на прошлое время, если выбран сегодняшний день
        const isPast = slotStart.getTime() < now.getTime() + 15 * 60 * 1000; // зазор 15 минут

        // Сколько механиков занято в этом интервале
        const overlappingAppointments = appointments.filter((app) => {
          const appStart = new Date(app.startTime).getTime();
          const appEnd = new Date(app.endTime).getTime();
          return slotStart.getTime() < appEnd && slotEnd.getTime() > appStart;
        });

        // Занятые механики
        const busyMechanicIds = new Set(
          overlappingAppointments.map((app) => app.mechanicId).filter(Boolean)
        );

        // Слот доступен, если количество занятых записей меньше общего числа мастеров
        const isAvailable =
          !isPast &&
          overlappingAppointments.length < totalMechanics &&
          busyMechanicIds.size < totalMechanics;

        slots.push({
          time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          available: isAvailable,
          freeSlotsLeft: Math.max(0, totalMechanics - overlappingAppointments.length),
        });
      }
    }

    return NextResponse.json({ slots, totalMechanics });
  } catch (error) {
    console.error("Ошибка при расчете слотов:", error);
    return NextResponse.json({ error: "Ошибка сервера при расчете доступного времени" }, { status: 500 });
  }
}
