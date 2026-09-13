"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 8 * 1024 * 1024;

/** "kapak-gorseli.JPG" → "kapak-gorseli.jpg"; Blob yolunda sorun çıkarmasın. */
function safeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Görsel alanı: dosya seçtirir, Vercel Blob'a yükler ve ortaya çıkan adresi
 * gizli bir input'ta taşır. Böylece formu gönderen mevcut server action'lar
 * değişmeden, eskiden olduğu gibi bir metin alanı okumaya devam eder.
 *
 * Eski kayıtlarda `/img/...` gibi yerel yollar var; onlar da önizlenebilsin
 * diye değer olduğu gibi korunuyor.
 */
export function ImageField({
  name,
  label,
  defaultValue,
  hint,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  className?: string;
}) {
  const toast = useToast();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(defaultValue ?? "");
  const [progress, setProgress] = useState<number | null>(null);

  const busy = progress !== null;

  const handleFile = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error({
        title: "Dosya çok büyük",
        description: `En fazla ${Math.round(MAX_BYTES / 1024 / 1024)} MB yükleyebilirsiniz.`,
      });
      return;
    }

    setProgress(0);

    try {
      const result = await upload(safeName(file.name), file, {
        access: "public",
        handleUploadUrl: "/api/admin/gorsel-yukle",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      setValue(result.url);
      toast.success({ title: "Görsel yüklendi" });
    } catch (error) {
      toast.error({
        title: "Görsel yüklenemedi",
        description:
          error instanceof Error ? error.message : "Lütfen tekrar deneyin.",
      });
    } finally {
      setProgress(null);
      // Aynı dosya tekrar seçilebilsin diye input'u sıfırla.
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <span className="text-sm font-semibold text-navy">{label}</span>

      {/* Server action'ın okuduğu asıl değer */}
      <input type="hidden" name={name} value={value} />

      <div className="flex items-start gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-cream">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center text-muted">
              <ImagePlus className="size-6" aria-hidden />
            </span>
          )}

          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/75 text-xs font-semibold text-navy">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {progress}%
            </span>
          )}
        </div>

        <div className="grid gap-2">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-cream disabled:opacity-60"
            >
              <Upload className="size-4" aria-hidden />
              {value ? "Değiştir" : "Görsel yükle"}
            </button>

            {value && !busy && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
                Kaldır
              </button>
            )}
          </div>

          <p className="text-xs text-muted">
            {hint ?? "JPG, PNG, WebP veya AVIF — en fazla 8 MB."}
          </p>
        </div>
      </div>
    </div>
  );
}
