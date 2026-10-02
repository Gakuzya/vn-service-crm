export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN не задан в .env. Сообщение симулировано:", { chatId, text });
    return { success: false, simulated: true, error: "TELEGRAM_BOT_TOKEN_MISSING" };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Ошибка Telegram Bot API:", data);
      return { success: false, error: data.description };
    }

    return { success: true, messageId: data.result.message_id };
  } catch (error: any) {
    console.error("Ошибка отправки Telegram сообщения:", error);
    return { success: false, error: error.message };
  }
}
