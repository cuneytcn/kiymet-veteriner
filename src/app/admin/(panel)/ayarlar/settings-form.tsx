"use client";

import { useActionState, useEffect } from "react";
import type { SiteSetting } from "@prisma/client";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { saveSettings, type SettingsState } from "./actions";

export function SettingsForm({ settings }: { settings: SiteSetting }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettings,
    null,
  );

  const toast = useToast();

  useEffect(() => {
    if (state?.ok) toast.success({ title: "Site ayarları kaydedildi" });
    else if (state?.error) toast.error({ title: "Kaydedilemedi", description: state.error });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const s = settings;

  return (
    <form action={formAction} className="grid gap-6">
      <Card title="Klinik bilgileri">
        <Field label="Klinik adı" htmlFor="clinicName" required>
          <Input id="clinicName" name="clinicName" defaultValue={s.clinicName} />
        </Field>
        <Field
          label="Slogan"
          htmlFor="tagline"
          hint="Ana sayfada başlığın altında görünür"
        >
          <Input id="tagline" name="tagline" defaultValue={s.tagline} />
        </Field>
        <Field
          label="Kısa tanıtım"
          htmlFor="description"
          hint="Footer ve paylaşım önizlemelerinde kullanılır"
          className="sm:col-span-2"
        >
          <Textarea id="description" name="description" defaultValue={s.description} />
        </Field>
      </Card>

      <Card title="İletişim">
        <Field label="Telefon" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={s.phone} />
        </Field>
        <Field label="Acil hat" htmlFor="emergencyPhone">
          <Input id="emergencyPhone" name="emergencyPhone" defaultValue={s.emergencyPhone} />
        </Field>
        <Field label="E-posta" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={s.email} />
        </Field>
        <Field
          label="WhatsApp numarası"
          htmlFor="whatsappNumber"
          hint="Boşsa acil hat kullanılır"
        >
          <Input id="whatsappNumber" name="whatsappNumber" defaultValue={s.whatsappNumber} />
        </Field>
      </Card>

      <Card title="Adres ve konum">
        <Field label="Açık adres" htmlFor="addressLine" className="sm:col-span-2">
          <Input id="addressLine" name="addressLine" defaultValue={s.addressLine} />
        </Field>
        <Field label="İlçe" htmlFor="district">
          <Input id="district" name="district" defaultValue={s.district} />
        </Field>
        <Field label="İl" htmlFor="city">
          <Input id="city" name="city" defaultValue={s.city} />
        </Field>
        <Field label="Posta kodu" htmlFor="postalCode">
          <Input id="postalCode" name="postalCode" defaultValue={s.postalCode} />
        </Field>
        <Field
          label="Google Haritalar bağlantısı"
          htmlFor="mapsUrl"
          hint="Yol tarifi butonunda kullanılır"
        >
          <Input id="mapsUrl" name="mapsUrl" defaultValue={s.mapsUrl} placeholder="https://maps.app.goo.gl/..." />
        </Field>
        <Field
          label="Enlem"
          htmlFor="latitude"
          hint="Arama motorlarına konum bildirir"
        >
          <Input id="latitude" name="latitude" defaultValue={s.latitude ?? ""} placeholder="38.4570" />
        </Field>
        <Field label="Boylam" htmlFor="longitude">
          <Input id="longitude" name="longitude" defaultValue={s.longitude ?? ""} placeholder="27.2180" />
        </Field>
      </Card>

      <Card title="Sosyal medya">
        <Field label="Instagram" htmlFor="instagramUrl">
          <Input id="instagramUrl" name="instagramUrl" defaultValue={s.instagramUrl} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="Facebook" htmlFor="facebookUrl">
          <Input id="facebookUrl" name="facebookUrl" defaultValue={s.facebookUrl} placeholder="https://facebook.com/..." />
        </Field>
        <Field label="YouTube" htmlFor="youtubeUrl">
          <Input id="youtubeUrl" name="youtubeUrl" defaultValue={s.youtubeUrl} placeholder="https://youtube.com/@..." />
        </Field>
        <Field label="TikTok" htmlFor="tiktokUrl">
          <Input id="tiktokUrl" name="tiktokUrl" defaultValue={s.tiktokUrl} placeholder="https://tiktok.com/@..." />
        </Field>
        <Field label="X (Twitter)" htmlFor="xUrl" className="sm:col-span-2">
          <Input id="xUrl" name="xUrl" defaultValue={s.xUrl} placeholder="https://x.com/..." />
        </Field>
      </Card>

      <Card title="İstatistikler">
        <Field
          label="Yıllık deneyim"
          htmlFor="yearsOfExperience"
          hint="Ana sayfa, hakkımızda ve tanıtım metinlerinde bu sayı kullanılır."
        >
          <Input
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={1}
            max={100}
            defaultValue={s.yearsOfExperience}
          />
        </Field>

        <Field
          label="Mutlu hasta sayısı"
          htmlFor="patientCount"
          hint="Serbest metin: &quot;5.000+&quot; gibi yazabilirsiniz."
        >
          <Input id="patientCount" name="patientCount" defaultValue={s.patientCount} />
        </Field>

        <Field label="Uzmanlık alanı sayısı" htmlFor="specialtyCount">
          <Input
            id="specialtyCount"
            name="specialtyCount"
            type="number"
            min={1}
            max={50}
            defaultValue={s.specialtyCount}
          />
        </Field>
      </Card>

      <Card title="Randevu kuralları">
        <Field
          label="Randevu aralığı (dakika)"
          htmlFor="slotDurationMinutes"
          hint="Her randevu için ayrılan süre"
        >
          <Input
            id="slotDurationMinutes"
            name="slotDurationMinutes"
            type="number"
            min={10}
            max={120}
            step={5}
            defaultValue={s.slotDurationMinutes}
          />
        </Field>
        <Field
          label="Aynı saatte kaç randevu"
          htmlFor="slotCapacity"
          hint="Birden fazla hekim varsa artırın"
        >
          <Input id="slotCapacity" name="slotCapacity" type="number" min={1} max={10} defaultValue={s.slotCapacity} />
        </Field>
        <Field
          label="En erken kaç saat sonrası"
          htmlFor="minLeadTimeHours"
          hint="Hazırlık payı; 2 ise iki saat sonrasına randevu alınabilir"
        >
          <Input id="minLeadTimeHours" name="minLeadTimeHours" type="number" min={0} max={72} defaultValue={s.minLeadTimeHours} />
        </Field>
        <Field
          label="En fazla kaç gün ileri"
          htmlFor="maxAdvanceDays"
          hint="Takvimin ne kadar ileri açılacağı"
        >
          <Input id="maxAdvanceDays" name="maxAdvanceDays" type="number" min={1} max={365} defaultValue={s.maxAdvanceDays} />
        </Field>
      </Card>

      <Card title="Arama motoru (SEO)">
        <Field
          label="Site başlığı"
          htmlFor="seoTitle"
          hint="Google'da görünen başlık — en fazla 70 karakter"
          className="sm:col-span-2"
        >
          <Input id="seoTitle" name="seoTitle" defaultValue={s.seoTitle} maxLength={70} />
        </Field>
        <Field
          label="Site açıklaması"
          htmlFor="seoDescription"
          hint="Google'da başlığın altındaki metin — en fazla 170 karakter"
          className="sm:col-span-2"
        >
          <Textarea id="seoDescription" name="seoDescription" defaultValue={s.seoDescription} maxLength={170} />
        </Field>
        <Field
          label="Google Search Console doğrulama kodu"
          htmlFor="googleVerification"
          hint="Yalnızca kod kısmı, etiketin tamamı değil"
          className="sm:col-span-2"
        >
          <Input id="googleVerification" name="googleVerification" defaultValue={s.googleVerification} />
        </Field>
      </Card>

      {state?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-danger-soft p-3.5 text-sm font-medium text-danger"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl bg-success-soft p-3.5 text-sm font-medium text-success"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Ayarlar kaydedildi.
        </p>
      )}

      <div className="sticky bottom-0 z-10 -mx-5 flex justify-end border-t border-line bg-white/95 px-5 py-4 backdrop-blur md:-mx-8 md:px-8">
        <Button type="submit" size="lg" disabled={pending} className="shadow-md">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          Ayarları Kaydet
        </Button>
      </div>
    </form>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-6">
      <h2 className="mb-5 font-head text-lg font-bold text-navy">
        {title}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
