import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Пользователь перешел по ссылке /start app_<id>
    if (text.startsWith("/start app_")) {
      const appointmentId = text.replace("/start app_", "").trim();

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { service: true, station: true },
      });

      if (!appointment) {
        await sendTelegramMessage(
          chatId,
          "❌ Запись не найдена. Возможно, она была удалена или ссылка повреждена."
        );
        return NextResponse.json({ ok: true });
      }

      // Привязываем telegramChatId к записи
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { telegramChatId: String(chatId) },
      });

      const dateStr = new Date(appointment.startTime).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
      const timeStr = new Date(appointment.startTime).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const welcomeMsg = `🚗 <b>Уведомления успешно подключены!</b>\n\n` +
        `Здравствуйте, <b>${appointment.clientName}</b>!\n` +
        `Вы записаны в СТО <b>«${appointment.station.name}»</b>:\n\n` +
        `• <b>Автомобиль:</b> ${appointment.carMake} ${appointment.carModel}\n` +
        `• <b>Услуга:</b> ${appointment.service.name}\n` +
        `• <b>Дата и время:</b> ${dateStr} в ${timeStr}\n` +
        `• <b>Адрес:</b> ${appointment.station.address || "Сервисный центр"}\n\n` +
        `🔔 <i>Мы пришлем вам напоминание за 24 часа до визита, а также уведомим, когда машина будет готова к выдаче.</i>`;

      await sendTelegramMessage(chatId, welcomeMsg);

      return NextResponse.json({ ok: true, linked: true, appointmentId });
    }

    // Обычная команда /help или /start без параметров
    if (text === "/start" || text === "/help") {
      await sendTelegramMessage(
        chatId,
        "👋 Добро пожаловать в бот автосервиса!\n\n" +
          "Для привязки записи воспользуйтесь кнопкой «Перейти в Telegram-бот» после оформления визита на нашем сайте."
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ошибка в Telegram webhook:", error);
    return NextResponse.json({ ok: true }); // Telegram требует 200 OK
  }
}
