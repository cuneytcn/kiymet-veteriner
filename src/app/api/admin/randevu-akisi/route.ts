import { NextResponse } from "next/server";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

/**
 * Panel açıkken yeni randevuları yoklamak için kullanılır.
 *
 * Vercel'de fonksiyonlar uzun ömürlü bağlantı tutamadığı (SSE/WebSocket) ve
 * uygulama Neon'un havuzlanmış bağlantısını kullandığı için Postgres
 * LISTEN/NOTIFY da geçmiyor; bu yüzden bildirim yoklama ile çalışıyor.
 *
 * İstemci en son aldığı sunucu saatini `since` olarak geri gönderir, biz de
 * o andan sonra oluşturulmuş randevuları döneriz. Saati sunucunun üretmesi,
 * istemci saati kaymışsa randevuların atlanmasını önler.
 */
export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = new Date();
  const sinceParam = new URL(request.url).searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;

  // Damga yoksa ya da bozuksa sadece saati döndür; istemci bir sonraki turda
  // geçerli damgayla sorar. Böylece ilk açılışta eski randevular ötmez.
  if (!since || Number.isNaN(since.getTime())) {
    return NextResponse.json({ now: now.toISOString(), appointments: [] });
  }

  const appointments = await db.appointment.findMany({
    where: { createdAt: { gt: since } },
    orderBy: { createdAt: "desc" },
    // Panel uzun süre arka planda kaldıysa bildirim yığılmasın.
    take: 10,
    select: {
      id: true,
      ownerName: true,
      petName: true,
      serviceLabel: true,
      date: true,
      time: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    now: now.toISOString(),
    appointments: appointments.map((appointment) => ({
      ...appointment,
      date: appointment.date.toISOString(),
      createdAt: appointment.createdAt.toISOString(),
    })),
  });
}
