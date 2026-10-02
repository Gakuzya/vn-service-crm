import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const staffPin = req.headers.get("x-staff-pin");
    const validPin = process.env.STAFF_PIN || "7777";

    if (!staffPin || staffPin.trim() !== validPin) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
    }

    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json({ error: "СТО не найдена" }, { status: 404 });
    }

    const mechanics = await prisma.mechanic.findMany({
      where: { stationId: station.id },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    });

    return NextResponse.json({ mechanics });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const staffPin = req.headers.get("x-staff-pin");
    const validPin = process.env.STAFF_PIN || "7777";

    if (!staffPin || staffPin.trim() !== validPin) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
    }

    const station = await prisma.station.findFirst();
    if (!station) {
      return NextResponse.json({ error: "СТО не найдена" }, { status: 404 });
    }

    const body = await req.json();
    const { name, specialty, isActive = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Укажите имя сотрудника" }, { status: 400 });
    }

    const mechanic = await prisma.mechanic.create({
      data: {
        stationId: station.id,
        name: name.trim(),
        specialty: specialty?.trim() || "Мастер СТО",
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, mechanic });
  } catch (error) {
    console.error("Ошибка при добавлении мастера:", error);
    return NextResponse.json({ error: "Не удалось добавить мастера" }, { status: 500 });
  }
}
