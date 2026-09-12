import "server-only";

/**
 * WhatsApp Cloud API bildirimi.
 *
 * Meta Business doğrulaması ve şablon onayı tamamlanana kadar env değişkenleri
 * boş kalır; o durumda sessizce atlanır ve site çalışmaya devam eder.
 */

type TemplateParams = {
  /** Alıcı, uluslararası formatta: +905xxxxxxxxx */
  to: string;
  /** Şablondaki {{1}}, {{2}}... yerine geçecek değerler, sırayla */
  params: string[];
  templateName?: string;
};

export function isWhatsappConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN,
  );
}

export async function sendWhatsappTemplate({
  to,
  params,
  templateName = process.env.WHATSAPP_TEMPLATE_NAME || "randevu_bildirimi",
}: TemplateParams): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!isWhatsappConfigured()) {
    return { ok: false, skipped: true };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const token = process.env.WHATSAPP_ACCESS_TOKEN!;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: { code: "tr" },
            components: [
              {
                type: "body",
                parameters: params.map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
        // Bildirim gecikmesi randevunun kaydını engellememeli
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `WhatsApp ${res.status}: ${body.slice(0, 300)}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
