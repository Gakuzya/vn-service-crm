import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { sendTelegramMessage } from "@/lib/telegram";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверка авторизации сотрудника СТО
    const staffPin = req.headers.get("x-staff-pin");
    const validPin = process.env.STAFF_PIN || "7777";

    if (!staffPin || staffPin.trim() !== validPin) {
      return NextResponse.json(
        { error: "Доступ запрещен. Изменять статус визита могут только сотрудники СТО." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, mechanicId, problemDesc } = body;

    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, mechanic: true, station: true },
    });

    if (!currentAppointment) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    const oldStatus = currentAppointment.status;
    const dataToUpdate: any = {};

    if (status && Object.values(AppointmentStatus).includes(status)) {
      dataToUpdate.status = status;
    }

    if (mechanicId !== undefined) {
      dataToUpdate.mechanicId = mechanicId === "" ? null : mechanicId;
    }

    if (problemDesc !== undefined) {
      dataToUpdate.problemDesc = problemDesc;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: dataToUpdate,
      include: {
        service: true,
        mechanic: true,
        station: true,
      },
    });

    // =========================================================================
    // РЕАЛЬНОЕ ВРЕМЯ: МГНОВЕННОЕ УВЕДОМЛЕНИЕ КЛИЕНТА В TELEGRAM ПРИ СМЕНЕ СТАТУСА
    // =========================================================================
    if (status && status !== oldStatus && updated.telegramChatId) {
      const carInfo = `${updated.carMake} ${updated.carModel}`;
      const mechanicName = updated.mechanic ? updated.mechanic.name : "Мастер VN SERVICE";
      let notifyText = "";

      switch (status) {
        case "IN_PROGRESS":
          notifyText =
            `🚗 <b>Ваш автомобиль взят в работу!</b>\n\n` +
            `Уважаемый(ая) <b>${updated.clientName}</b>!\n` +
            `Мастер <b>${mechanicName}</b> принял ваш <b>${carInfo}</b> на пост.\n` +
            `🛠 <b>Выполняется:</b> ${updated.service.name}\n\n` +
            `<i>Мы пришлем вам уведомление, как только автомобиль будет готов к выдаче!</i>`;
          break;

        case "WAITING_PARTS":
          notifyText =
            `⏳ <b>Статус ремонта: Ожидание запчастей</b>\n\n` +
            `По вашему автомобилю <b>${carInfo}</b> мастер запросил детали со склада VN PARTS.\n` +
            `Детали подбираются по VIN-коду. При необходимости мастер свяжется с вами по телефону.`;
          break;

        case "READY":
          notifyText =
            `✅ <b>Ваш автомобиль готов к выдаче!</b>\n\n` +
            `Уважаемый(ая) <b>${updated.clientName}</b>!\n` +
            `Все работы по автомобилю <b>${carInfo}</b> успешно завершены.\n\n` +
            `📍 <b>Ждем вас в СТО «VN SERVICE»:</b>\n` +
            `г. Астана, район Байконыр, пр. Акжол, 52/1\n` +
            `📞 Телефон: +7 (771) 534-86-56\n` +
            `💳 Оплата: Kaspi QR / Рассрочка / Карта`;
          break;

        case "COMPLETED":
          notifyText =
            `🤝 <b>Заказ-наряд #${updated.id.slice(0, 8).toUpperCase()} закрыт</b>\n\n` +
            `Спасибо, что доверили обслуживание вашего <b>${carInfo}</b> автосервису VN SERVICE!\n\n` +
            `⭐ <i>Пожалуйста, оцените нашу работу в 2ГИС:</i>\n` +
            `https://2gis.kz/astana/search/VN%20SERVICE\n\n` +
            `Счастливого и безопасного пути!`;
          break;

        case "CANCELLED":
          notifyText =
            `❌ <b>Запись отменена</b>\n\n` +
            `Ваша запись на <b>${carInfo}</b> отменена мастером.\n` +
            `Если у вас остались вопросы, пожалуйста, свяжитесь с нами: +7 (771) 534-86-56`;
          break;
      }

      if (notifyText) {
        // Отправка в реальном времени
        sendTelegramMessage(updated.telegramChatId, notifyText).catch((err) =>
          console.error("Ошибка отправки Telegram нотификации при смене статуса:", err)
        );
      }
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Ошибка при обновлении записи:", error);
    return NextResponse.json({ error: "Не удалось обновить запись" }, { status: 500 });
  }
}
