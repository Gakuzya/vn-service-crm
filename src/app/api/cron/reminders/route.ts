import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const force = searchParams.get("force") === "true"; // Для ручного тестирования

    const expectedSecret = process.env.CRON_SECRET || "auto-crm-secret-cron-key";
    if (secret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Неверный ключ доступа к Cron" }, { status: 401 });
    }

    const now = new Date();

    // Окно напоминания: от 23 до 25 часов от текущего момента
    const windowStart = force ? now : new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Ищем записи, требующие напоминания
    const appointmentsToRemind = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        reminderSent24h: false,
        telegramChatId: { not: null },
        status: {
          notIn: ["CANCELLED", "COMPLETED"],
        },
      },
      include: {
        service: true,
        station: true,
        mechanic: true,
      },
    });

    const results = {
      found: appointmentsToRemind.length,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const app of appointmentsToRemind) {
      if (!app.telegramChatId) continue;

      const dateStr = new Date(app.startTime).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        weekday: "short",
      });
      const timeStr = new Date(app.startTime).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const reminderText =
        `🔔 <b>Напоминание о записи на ремонт (завтра в ${timeStr})</b>\n\n` +
        `Уважаемый(ая) <b>${app.clientName}</b>!\n` +
        `Ждем вас завтра в автосервисе <b>«${app.station.name}»</b>:\n\n` +
        `🚗 <b>Автомобиль:</b> ${app.carMake} ${app.carModel} ${app.carPlateNumber ? `(${app.carPlateNumber})` : ""}\n` +
        `🛠 <b>Услуга:</b> ${app.service.name}\n` +
        `⏰ <b>Время начала:</b> ${dateStr}, ${timeStr}\n` +
        `👨‍🔧 <b>Мастер:</b> ${app.mechanic ? app.mechanic.name : "Дежурный мастер"}\n` +
        `📍 <b>Адрес:</b> ${app.station.address || "г. Москва"}\n\n` +
        `📞 Телефон для связи: ${app.station.phone || "+7 (495) 999-88-77"}\n\n` +
        `<i>Если ваши планы изменились, пожалуйста, предупредите нас заранее по телефону.</i>`;

      const sendResult = await sendTelegramMessage(app.telegramChatId, reminderText);

      if (sendResult.success || sendResult.simulated) {
        // Помечаем флаг отправки напоминания
        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSent24h: true },
        });

        results.sent++;
        results.details.push({
          id: app.id,
          client: app.clientName,
          status: sendResult.simulated ? "simulated" : "sent",
        });
      } else {
        results.failed++;
        results.details.push({
          id: app.id,
          client: app.clientName,
          status: "failed",
          error: sendResult.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...results,
    });
  } catch (error) {
    console.error("Ошибка при выполнении Cron напоминаний:", error);
    return NextResponse.json({ error: "Ошибка Cron рассылки" }, { status: 500 });
  }
}
