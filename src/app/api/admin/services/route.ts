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

    const services = await prisma.service.findMany({
      where: { stationId: station.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ services });
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
    const { name, description, durationMinutes, price, isActive = true } = body;

    if (!name || !durationMinutes || price === undefined) {
      return NextResponse.json({ error: "Заполните название, длительность и цену" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        stationId: station.id,
        name: name.trim(),
        description: description?.trim() || null,
        durationMinutes: parseInt(durationMinutes, 10),
        price: parseFloat(price),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Ошибка при создании услуги:", error);
    return NextResponse.json({ error: "Не удалось создать услугу" }, { status: 500 });
  }
}
