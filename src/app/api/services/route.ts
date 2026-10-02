import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const station = await prisma.station.findFirst({
      include: {
        services: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!station) {
      return NextResponse.json({ error: "Станция не найдена" }, { status: 404 });
    }

    return NextResponse.json({
      station: {
        id: station.id,
        name: station.name,
        address: station.address,
        phone: station.phone,
      },
      services: station.services,
    });
  } catch (error) {
    console.error("Ошибка при получении услуг:", error);
    return NextResponse.json({ error: "Ошибка сервера при загрузке услуг" }, { status: 500 });
  }
}
