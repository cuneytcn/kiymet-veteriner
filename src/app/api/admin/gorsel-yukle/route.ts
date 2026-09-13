import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireUser } from "@/auth";

/** Panelden yüklenebilecek görsel türleri. */
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/** 8 MB: telefonla çekilmiş fotoğraflar rahat sığsın, depo da şişmesin. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Görsel yükleme jetonu üretir.
 *
 * Dosya tarayıcıdan doğrudan Vercel Blob'a gidiyor; sunucu üzerinden
 * geçirmiyoruz çünkü Vercel'de istek gövdesi 4.5 MB ile sınırlı ve telefon
 * fotoğrafları bunu kolayca aşıyor. Bu uç yalnızca kısa ömürlü yükleme
 * jetonunu veriyor, jeton da sadece oturum açmış yöneticiye çıkıyor.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await requireUser();
        if (!user) throw new Error("Yetkisiz");

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          // Aynı adlı dosyalar birbirini ezmesin.
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    // handleUpload yetki ve doğrulama hatalarını da buraya düşürür.
    const message =
      error instanceof Error ? error.message : "Görsel yüklenemedi.";

    return NextResponse.json(
      { error: message },
      { status: message === "Yetkisiz" ? 401 : 400 },
    );
  }
}
