import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Загрузка переменных окружения если запуск напрямую через tsx
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("❌ ОШИБКА: Переменная TELEGRAM_BOT_TOKEN не задана в файле .env!");
  console.log("👉 Добавьте токен от @BotFather в .env и перезапустите скрипт.");
  process.exit(1);
}

async function sendTelegramMessage(chatId: number | string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("Ошибка отправки сообщения:", err);
  }
}

async function startPolling() {
  console.log("🤖 [TELEGRAM BOT] Запуск в режиме Long-Polling для локальной разработки...");

  // Получаем информацию о боте
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();
    if (!meData.ok) {
      console.error("❌ Неверный токен бота:", meData.description);
      process.exit(1);
    }
    console.log(`✅ Бот успешно подключен: @${meData.result.username} (${meData.result.first_name})`);

    // Удаляем предыдущий вебхук, чтобы polling работал без конфликтов
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    console.log("📡 Слушаем входящие сообщения от клиентов СТО «VN SERVICE»...");
  } catch (err) {
    console.error("Ошибка подключения к Telegram API:", err);
    process.exit(1);
  }

  let offset = 0;

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`
      );
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          const message = update.message;
          if (!message || !message.text) continue;

          const chatId = message.chat.id;
          const text = message.text.trim();
          const senderName = message.from?.first_name || "Уважаемый клиент";

          console.log(`📩 Новое сообщение от ${senderName} (${chatId}): "${text}"`);

          // 1. Обработка deep-link перехода: /start app_<id>
          if (text.startsWith("/start app_")) {
            const appointmentId = text.replace("/start app_", "").trim();

            const appointment = await prisma.appointment.findUnique({
              where: { id: appointmentId },
              include: { service: true, station: true, mechanic: true },
            });

            if (!appointment) {
              await sendTelegramMessage(
                chatId,
                "❌ <b>Запись не найдена.</b>\nВозможно, заказ-наряд был удален или ссылка устарела."
              );
              continue;
            }

            // Привязываем chatId к записи
            await prisma.appointment.update({
              where: { id: appointmentId },
              data: { telegramChatId: String(chatId) },
            });

            const dateStr = new Date(appointment.startTime).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              weekday: "short",
            });
            const timeStr = new Date(appointment.startTime).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            });

            const priceStr =
              Number(appointment.service.price) === 0
                ? "0 ₸ (Бесплатно по акции)"
                : `${Number(appointment.service.price).toLocaleString("ru-RU")} ₸`;

            const welcomeMsg =
              `🚗 <b>Уведомления СТО «VN SERVICE» успешно подключены!</b>\n\n` +
              `Здравствуйте, <b>${appointment.clientName}</b>!\n` +
              `Ваш визит зафиксирован в системе:\n\n` +
              `• <b>Автомобиль:</b> ${appointment.carMake} ${appointment.carModel} ${appointment.carPlateNumber ? `(${appointment.carPlateNumber})` : ""}\n` +
              `• <b>Услуга:</b> ${appointment.service.name}\n` +
              `• <b>Стоимость:</b> ${priceStr}\n` +
              `• <b>Дата и время:</b> ${dateStr} в ${timeStr}\n` +
              `• <b>Мастер:</b> ${appointment.mechanic ? appointment.mechanic.name : "Дежурный мастер VN"}\n` +
              `• <b>Адрес:</b> г. Астана, район Байконыр, пр. Акжол, 52/1\n\n` +
              `🔔 <i>Мы напомним вам о визите за 24 часа, а также пришлем сообщение, когда автомобиль будет готов к выдаче!</i>`;

            await sendTelegramMessage(chatId, welcomeMsg);
            console.log(`✅ Привязан Telegram chatId ${chatId} к записи #${appointment.id.slice(0, 8)}`);
            continue;
          }

          // 2. Стандартная команда /start
          if (text === "/start" || text === "/help") {
            const helpMsg =
              `👋 <b>Здравствуйте, ${senderName}!</b>\n\n` +
              `Это официальный бот автосервиса <b>«VN SERVICE» (г. Астана)</b>.\n\n` +
              `📍 <b>Адрес:</b> пр. Акжол, 52/1\n` +
              `📞 <b>Телефоны:</b> +7 (771) 534-86-56, +7 (747) 291-18-00\n` +
              `⏱ <b>Режим работы:</b> 09:00 – 20:00 без выходных\n\n` +
              `Чтобы привязать уведомления о ремонте, оформите визит на сайте и нажмите кнопку <b>«Подключить Telegram-уведомления»</b>.`;

            await sendTelegramMessage(chatId, helpMsg);
          }
        }
      }
    } catch (err) {
      console.error("Ошибка цикла polling (повтор через 5 сек):", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

startPolling();
