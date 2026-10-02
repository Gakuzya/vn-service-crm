import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Разрешены только изображения (JPEG, PNG, WEBP)" }, { status: 400 });
    }

    // Лимит размера: 10 МБ
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Размер файла не должен превышать 10 МБ" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Пытаемся загрузить в Supabase Storage бакет `repair-photos`
    const { data, error } = await supabase.storage
      .from("repair-photos")
      .upload(cleanFileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.warn("Supabase Storage upload warning (бакет еще не создан или ограничен):", error.message);
      
      // Fallback: кодируем в base64 data-url, чтобы клиент не блокировался
      const base64Data = buffer.toString("base64");
      const fallbackUrl = `data:${file.type};base64,${base64Data}`;

      return NextResponse.json({
        url: fallbackUrl,
        isFallback: true,
        message: "Сохранено локально (создайте бакет repair-photos в Supabase для постоянного URL)",
      });
    }

    // Получаем постоянный публичный URL
    const { data: publicUrlData } = supabase.storage
      .from("repair-photos")
      .getPublicUrl(data.path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: data.path,
      isFallback: false,
    });
  } catch (error) {
    console.error("Ошибка при загрузке фото:", error);
    return NextResponse.json({ error: "Не удалось загрузить изображение" }, { status: 500 });
  }
}
