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
    const { name, specialty, isActive } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (specialty !== undefined) dataToUpdate.specialty = specialty?.trim() || null;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const updated = await prisma.mechanic.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, mechanic: updated });
  } catch (error) {
    return NextResponse.json({ error: "Не удалось обновить данные сотрудника" }, { status: 500 });
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

    const count = await prisma.appointment.count({ where: { mechanicId: id } });
    if (count > 0) {
      // Мягкая деактивация, если за мастером уже числятся записи
      await prisma.mechanic.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        deactivated: true,
        message: "Мастер деактивирован, так как в базе есть привязанные заказ-наряды",
      });
    }

    await prisma.mechanic.delete({ where: { id } });
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    return NextResponse.json({ error: "Не удалось удалить мастера" }, { status: 500 });
  }
}
