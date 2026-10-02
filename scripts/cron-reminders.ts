import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function sendTelegramDirect(token: string, chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
  return res.json();
}

async function runCron() {
  console.log("⏰ [CRON] Запуск проверки напоминаний о визитах за 24 часа...");

  const now = new Date();
  // Окно от 23 до 25 часов
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const token = process.env.TELEGRAM_BOT_TOKEN;

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: windowStart, lte: windowEnd },
      reminderSent24h: false,
      telegramChatId: { not: null },
      status: { notIn: ["CANCELLED", "COMPLETED"] },
    },
    include: { service: true, station: true, mechanic: true },
  });

  console.log(`🔍 Найдено записей для уведомления: ${appointments.length}`);

  for (const app of appointments) {
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

    const msg =
      `🔔 <b>Напоминание о записи на ремонт (завтра в ${timeStr})</b>\n\n` +
      `Здравствуйте, <b>${app.clientName}</b>!\n` +
      `Напоминаем о визите на СТО <b>«${app.station.name}»</b>:\n\n` +
      `🚗 <b>Авто:</b> ${app.carMake} ${app.carModel} ${app.carPlateNumber ? `(${app.carPlateNumber})` : ""}\n` +
      `🛠 <b>Услуга:</b> ${app.service.name}\n` +
      `⏰ <b>Время:</b> ${dateStr} в ${timeStr}\n` +
      `📍 <b>Адрес:</b> ${app.station.address}\n\n` +
      `📞 Телефон для связи: ${app.station.phone}`;

    if (token) {
      const res = await sendTelegramDirect(token, app.telegramChatId, msg);
      if (res.ok) {
        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSent24h: true },
        });
        console.log(`✓ Напоминание отправлено для ${app.clientName} (${app.telegramChatId})`);
      } else {
        console.error(`✗ Ошибка отправки для ${app.clientName}:`, res.description);
      }
    } else {
      console.log(`ℹ️ [SIMULATION] TELEGRAM_BOT_TOKEN не задан. Напоминание готово к отправке для ${app.clientName}:`, msg);
      await prisma.appointment.update({
        where: { id: app.id },
        data: { reminderSent24h: true },
      });
    }
  }

  console.log("🏁 [CRON] Выполнение завершено.");
}

runCron()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
