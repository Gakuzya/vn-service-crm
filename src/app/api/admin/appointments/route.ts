import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const stationId = searchParams.get("stationId");

    const station = stationId
      ? await prisma.station.findUnique({ where: { id: stationId } })
      : await prisma.station.findFirst();

    if (!station) {
      return NextResponse.json({ error: "СТО не найдена" }, { status: 404 });
    }

    // Временные границы выбранного дня
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Получаем мастеров СТО
    const mechanics = await prisma.mechanic.findMany({
      where: { stationId: station.id, isActive: true },
      orderBy: { name: "asc" },
    });

    // Получаем записи на выбранную дату
    const appointments = await prisma.appointment.findMany({
      where: {
        stationId: station.id,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      include: {
        service: true,
        mechanic: true,
      },
      orderBy: { startTime: "asc" },
    });

    // Считаем общую статистику на день
    const stats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      inProgress: appointments.filter((a) => a.status === "IN_PROGRESS").length,
      waitingParts: appointments.filter((a) => a.status === "WAITING_PARTS").length,
      ready: appointments.filter((a) => a.status === "READY").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      totalRevenue: appointments
        .filter((a) => a.status !== "CANCELLED")
        .reduce((sum, a) => sum + Number(a.service?.price || 0), 0),
    };

    return NextResponse.json({
      station,
      mechanics,
      appointments,
      stats,
    });
  } catch (error) {
    console.error("Ошибка при получении записей CRM:", error);
    return NextResponse.json({ error: "Ошибка сервера при загрузке CRM данных" }, { status: 500 });
  }
}
