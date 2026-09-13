"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const STORAGE_KEY = "admin:sesli-bildirim";
const POLL_MS = 30_000;

type NewAppointment = {
  id: string;
  ownerName: string;
  petName: string;
  serviceLabel: string;
  time: string;
  createdAt: string;
};

// --- Ses tercihi ------------------------------------------------------------
// localStorage bir dış kaynak: render sırasında okunursa sunucu çıktısıyla
// uyuşmaz. useSyncExternalStore ile okuyup sunucuda "kapalı" varsayıyoruz.

let soundPref: boolean | null = null;
const prefListeners = new Set<() => void>();

function readSoundPref() {
  if (soundPref === null) {
    try {
      soundPref = localStorage.getItem(STORAGE_KEY) === "acik";
    } catch {
      // Gizli sekmede localStorage kapalı olabilir.
      soundPref = false;
    }
  }

  return soundPref;
}

function writeSoundPref(next: boolean) {
  soundPref = next;

  try {
    localStorage.setItem(STORAGE_KEY, next ? "acik" : "kapali");
  } catch {
    // Saklanamazsa tercih oturum boyunca geçerli kalır.
  }

  for (const listener of prefListeners) listener();
}

function subscribeSoundPref(listener: () => void) {
  prefListeners.add(listener);
  return () => {
    prefListeners.delete(listener);
  };
}

// --- Ses --------------------------------------------------------------------

/** Sekme başlığındaki "(2) " önekini temizler. */
function stripBadge(title: string) {
  return title.replace(/^\(\d+\)\s*/, "");
}

/**
 * Kısa bir "ding": iki sinüs notası, yumuşak sönümle.
 * Projeye ses dosyası eklememek için Web Audio ile üretiliyor.
 */
function playDing(ctx: AudioContext) {
  const start = ctx.currentTime;

  for (const { freq, at } of [
    { freq: 988, at: 0 }, // B5
    { freq: 1319, at: 0.11 }, // E6
  ]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = freq;

    // exponentialRamp sıfırı kabul etmez, çok küçük bir değerden başlıyoruz.
    gain.gain.setValueAtTime(0.0001, start + at);
    gain.gain.exponentialRampToValueAtTime(0.3, start + at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + at + 0.45);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start + at);
    oscillator.stop(start + at + 0.5);
  }
}

/**
 * Panel açıkken gelen yeni randevuları sesli ve görsel olarak duyurur.
 *
 * Tarayıcılar kullanıcı sayfayla etkileşmeden ses çalmayı engellediğinden ses,
 * düğmeye basıldığı anda açılan AudioContext üzerinden çalınır; tercih saklanır
 * ve sonraki girişlerde ilk tıklama/tuş vuruşunda yeniden canlanır.
 */
export function NewAppointmentAlerts() {
  const toast = useToast();
  const soundOn = useSyncExternalStore(
    subscribeSoundPref,
    readSoundPref,
    () => false,
  );

  const [unseen, setUnseen] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  // İlk turda eski randevular ötmesin diye sunucu saatiyle senkronlanır.
  const sinceRef = useRef<string | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) return null;
      audioRef.current = new AudioCtx();
    }

    return audioRef.current;
  }, []);

  // Tercih açıkken sayfa yeniden yüklendiyse AudioContext askıda başlar;
  // ilk kullanıcı hareketinde canlandırıyoruz.
  useEffect(() => {
    if (!soundOn) return;

    const unlock = () => {
      void ensureAudio()?.resume();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureAudio, soundOn]);

  const toggleSound = useCallback(() => {
    const next = !readSoundPref();
    writeSoundPref(next);

    if (!next) return;

    // Tıklama bir kullanıcı hareketi: sesi burada açıp örnek çalıyoruz ki
    // yönetici hem izni versin hem sesin nasıl olduğunu duysun.
    const ctx = ensureAudio();
    if (ctx) void ctx.resume().then(() => playDing(ctx));
  }, [ensureAudio]);

  const announce = useCallback(
    (appointments: NewAppointment[]) => {
      setUnseen((count) => count + appointments.length);

      if (readSoundPref()) {
        const ctx = ensureAudio();
        if (ctx) void ctx.resume().then(() => playDing(ctx));
      }

      const [latest] = appointments;
      toast.info({
        title:
          appointments.length === 1
            ? "Yeni randevu talebi"
            : `${appointments.length} yeni randevu talebi`,
        description:
          appointments.length === 1
            ? `${latest.ownerName} — ${latest.petName} · ${latest.serviceLabel} · ${latest.time}`
            : `En yenisi: ${latest.ownerName} — ${latest.petName}`,
        duration: 8000,
      });
    },
    [ensureAudio, toast],
  );

  // Yoklama döngüsü. Turlar üst üste binmesin diye setInterval yerine
  // zincirleme setTimeout kullanılıyor.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const query = sinceRef.current
          ? `?since=${encodeURIComponent(sinceRef.current)}`
          : "";

        const response = await fetch(`/api/admin/randevu-akisi${query}`, {
          cache: "no-store",
        });

        // Oturum düştüyse yoklamayı bırak; layout zaten girişe yönlendirir.
        if (response.status === 401) return;

        if (response.ok) {
          const data = (await response.json()) as {
            now: string;
            appointments: NewAppointment[];
          };

          sinceRef.current = data.now;
          if (data.appointments.length > 0) announce(data.appointments);
        }
      } catch {
        // Geçici ağ hatası döngüyü kırmasın, bir sonraki turda denenir.
      }

      if (!cancelled) timer = setTimeout(tick, POLL_MS);
    };

    // İlk tur hemen: sunucu saatini alıp başlangıç damgasını kuruyoruz.
    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [announce]);

  // Okunmamış sayısını sekme başlığına yansıt, panele dönünce sıfırla.
  useEffect(() => {
    const base = stripBadge(document.title);
    document.title = unseen > 0 ? `(${unseen}) ${base}` : base;
  }, [unseen]);

  useEffect(() => {
    const clear = () => setUnseen(0);
    window.addEventListener("focus", clear);
    return () => window.removeEventListener("focus", clear);
  }, []);

  const Icon = soundOn ? Bell : BellOff;

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={soundOn}
      className={cn(
        "mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        soundOn
          ? "text-brand-dark hover:bg-brand-soft"
          : "text-muted hover:bg-cream hover:text-navy",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      Sesli bildirim: {soundOn ? "Açık" : "Kapalı"}
    </button>
  );
}
