import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staffPin = req.headers.get("x-staff-pin");
    const validPin = process.env.STAFF_PIN || "7777";

    if (!staffPin || staffPin.trim() !== validPin) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, durationMinutes, price, isActive } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description?.trim() || null;
    if (durationMinutes !== undefined) dataToUpdate.durationMinutes = parseInt(durationMinutes, 10);
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const updated = await prisma.service.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    return NextResponse.json({ error: "Не удалось обновить услугу" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staffPin = req.headers.get("x-staff-pin");
    const validPin = process.env.STAFF_PIN || "7777";

    if (!staffPin || staffPin.trim() !== validPin) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
    }

    const { id } = await params;

    // Проверяем, есть ли привязанные записи
    const count = await prisma.appointment.count({ where: { serviceId: id } });
    if (count > 0) {
      // Если есть записи, мягко деактивируем, чтобы не нарушать целостность истории
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        deactivated: true,
        message: "Услуга деактивирована, так как по ней уже есть история визитов",
      });
    }

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    return NextResponse.json({ error: "Не удалось удалить услугу" }, { status: 500 });
  }
}
