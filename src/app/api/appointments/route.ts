import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceId,
      stationId,
      startTime,
      endTime,
      clientName,
      clientPhone,
      carMake,
      carModel,
      carPlateNumber,
      problemDesc,
      photoUrls = [],
    } = body;

    if (!serviceId || !startTime || !endTime || !clientName || !clientPhone || !carMake || !carModel) {
      return NextResponse.json({ error: "Пожалуйста, заполните все обязательные поля" }, { status: 400 });
    }

    // Определяем СТО
    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst();

    if (!station) {
      return NextResponse.json({ error: "СТО не найдена" }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Подбираем свободного механика для данного слота
    const mechanics = await prisma.mechanic.findMany({
      where: { stationId: station.id, isActive: true },
      include: {
        appointments: {
          where: {
            status: { not: "CANCELLED" },
            startTime: { lt: end },
            endTime: { gt: start },
          },
        },
      },
    });

    // Находим механика без пересечений по времени
    const freeMechanic = mechanics.find((m) => m.appointments.length === 0);

    const appointment = await prisma.appointment.create({
      data: {
        stationId: station.id,
        serviceId,
        mechanicId: freeMechanic ? freeMechanic.id : null,
        startTime: start,
        endTime: end,
        clientName,
        clientPhone,
        carMake,
        carModel,
        carPlateNumber: carPlateNumber?.trim() || null,
        problemDesc: problemDesc?.trim() || null,
        photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
        status: AppointmentStatus.PENDING,
      },
      include: {
        service: true,
        mechanic: true,
        station: true,
      },
    });

    const rawUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "AutoMasterCrmBot";
    const botUsername = rawUsername.replace(/^@/, "").trim();
    const telegramLink = `https://t.me/${botUsername}?start=app_${appointment.id}`;

    return NextResponse.json({
      success: true,
      appointment,
      telegramLink,
    });
  } catch (error) {
    console.error("Ошибка при создании записи:", error);
    return NextResponse.json({ error: "Не удалось оформить запись. Попробуйте снова." }, { status: 500 });
  }
}
