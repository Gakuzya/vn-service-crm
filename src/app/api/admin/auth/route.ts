import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const validPin = process.env.STAFF_PIN || "7777";

    if (!pin || String(pin).trim() !== validPin) {
      return NextResponse.json(
        { error: "Неверный PIN-код сотрудника" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      staff: {
        role: "service_advisor",
        name: "Мастер-приемщик",
        stationName: "СТО Nomad Auto Pro",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка авторизации" }, { status: 500 });
  }
}
