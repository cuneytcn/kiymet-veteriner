import "server-only";
import { Resend } from "resend";
import { formatDateKeyTr } from "@/lib/hours";

export type AppointmentEmailData = {
  ownerName: string;
  phone: string;
  email: string;
  petName: string;
  petTypeLabel: string;
  petBreed?: string | null;
  petAge?: string | null;
  serviceLabel: string;
  date: string;
  time: string;
  notes?: string | null;
  address?: string | null;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  adminUrl?: string;
};

function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_FROM_EMAIL);
}

const esc = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function row(label: string, value?: string | null) {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 0;color:#6b6660;font-size:14px;width:150px;vertical-align:top">${esc(label)}</td>
    <td style="padding:8px 0;color:#1c1a17;font-size:14px;font-weight:600">${esc(value)}</td>
  </tr>`;
}

function shell(title: string, intro: string, body: string, footer: string) {
  return `<!doctype html>
<html lang="tr"><body style="margin:0;padding:24px;background:#f6f5f3;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e5e1">
    <tr><td style="background:#0f5f5a;padding:24px 28px">
      <p style="margin:0;color:#fff;font-size:18px;font-weight:700">${esc(title)}</p>
    </td></tr>
    <tr><td style="padding:28px">
      <p style="margin:0 0 20px;color:#4a4640;font-size:15px;line-height:1.6">${intro}</p>
      <table role="presentation" style="width:100%;border-collapse:collapse">${body}</table>
    </td></tr>
    <tr><td style="padding:20px 28px;background:#faf9f8;border-top:1px solid #e8e5e1;color:#8a847c;font-size:13px;line-height:1.6">
      ${footer}
    </td></tr>
  </table>
</body></html>`;
}

/** Kliniğe düşen bildirim — aksiyon alınacak tüm bilgiyi içerir. */
function clinicEmail(d: AppointmentEmailData) {
  const body = [
    row("Tarih", `${formatDateKeyTr(d.date)} · ${d.time}`),
    row("Hizmet", d.serviceLabel),
    row("Sahibi", d.ownerName),
    row("Telefon", d.phone),
    row("E-posta", d.email),
    row("Adres", d.address),
    row("Hayvan", `${d.petName} (${d.petTypeLabel})`),
    row("Irk", d.petBreed),
    row("Yaş", d.petAge),
    row("Not", d.notes),
  ].join("");

  const footer = d.adminUrl
    ? `Randevuyu onaylamak için <a href="${esc(d.adminUrl)}" style="color:#0f5f5a;font-weight:600">yönetim paneline</a> gidin.`
    : "Randevuyu yönetim panelinden onaylayabilirsiniz.";

  return shell(
    "Yeni randevu talebi",
    `<strong>${esc(d.ownerName)}</strong> adlı müşteriden yeni bir randevu talebi geldi.`,
    body,
    footer,
  );
}

/** Müşteriye giden teyit — talebin alındığını bildirir, kesinleşmiş demez. */
function customerEmail(d: AppointmentEmailData) {
  const body = [
    row("Tarih", formatDateKeyTr(d.date)),
    row("Saat", d.time),
    row("Hizmet", d.serviceLabel),
    row("Hasta", `${d.petName} (${d.petTypeLabel})`),
  ].join("");

  const footer = `${esc(d.clinicName)}<br>${esc(d.clinicAddress)}<br>Tel: ${esc(d.clinicPhone)}
    <br><br>Randevunuzu değiştirmek veya iptal etmek için bizi arayabilirsiniz.`;

  return shell(
    "Randevu talebiniz alındı",
    `Merhaba <strong>${esc(d.ownerName)}</strong>, talebiniz bize ulaştı.
     Ekibimiz en kısa sürede sizi arayarak randevunuzu <strong>teyit edecek</strong>.
     Bu e-posta randevunuzun kesinleştiği anlamına gelmez.`,
    body,
    footer,
  );
}

export async function sendAppointmentEmails(d: AppointmentEmailData): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  if (!isConfigured()) return { ok: false, skipped: true };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = `${d.clinicName} <${process.env.NOTIFY_FROM_EMAIL}>`;
  const clinicTo = process.env.NOTIFY_TO_EMAIL;

  try {
    const jobs: Promise<unknown>[] = [];

    if (clinicTo) {
      jobs.push(
        resend.emails.send({
          from,
          to: clinicTo,
          replyTo: d.email,
          subject: `Yeni randevu: ${d.ownerName} · ${formatDateKeyTr(d.date)} ${d.time}`,
          html: clinicEmail(d),
        }),
      );
    }

    jobs.push(
      resend.emails.send({
        from,
        to: d.email,
        subject: `Randevu talebiniz alındı — ${d.clinicName}`,
        html: customerEmail(d),
      }),
    );

    const results = await Promise.allSettled(jobs);
    const failed = results.find((r) => r.status === "rejected");

    if (failed && failed.status === "rejected") {
      return { ok: false, error: String(failed.reason).slice(0, 300) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
