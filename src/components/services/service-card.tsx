import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@prisma/client";
import { ServiceIcon } from "@/components/ui/icon";

/**
 * Hizmetin kendi görseli yüklenmediyse slug'a göre uygun bir stok görsel.
 * Klinik fotoğrafları geldikçe admin panelinden tek tek değiştirilecek.
 */
const FALLBACK_IMAGES: Record<string, string> = {
  "genel-muayene": "/img/vet-hand-kitten.webp",
  "asi-saglik": "/img/cat-gray.webp",
  cerrahi: "/img/dog-outdoors.webp",
  laboratuvar: "/img/dog-puppy.webp",
  acil: "/img/hero-dog.webp",
  "dis-bakimi": "/img/cat-pet.webp",
};

const DEFAULT_IMAGE = "/img/vet-kitten.webp";

/** Kartların rozet renkleri sırayla dönüyor — tek renkten daha canlı. */
const BADGE_TONES = [
  "bg-brand-soft text-brand",
  "bg-leaf-soft text-leaf-dark",
  "bg-sun-soft text-sun-dark",
];

export function ServiceCard({
  service,
  index = 0,
}: {
  service: Service;
  index?: number;
}) {
  const image =
    service.coverImage || FALLBACK_IMAGES[service.slug] || DEFAULT_IMAGE;

  return (
    <Link
      href={`/hizmetler/${service.slug}`}
      className="group/svc reveal flex flex-col overflow-hidden rounded-card bg-white shadow-sm transition-all duration-300 hover:-translate-y-2.5 hover:shadow-md"
    >
      <span className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 360px"
          className="object-cover transition-transform duration-600 group-hover/svc:scale-108"
        />

        <span
          className={`absolute bottom-[-1.625rem] left-5 grid size-[3.625rem] place-items-center rounded-full shadow-sm transition-transform duration-400 group-hover/svc:-rotate-12 ${
            BADGE_TONES[index % BADGE_TONES.length]
          }`}
        >
          <ServiceIcon name={service.icon} className="size-[1.625rem]" />
        </span>
      </span>

      <span className="flex flex-1 flex-col px-6 pt-[2.375rem] pb-[1.625rem]">
        <h3 className="text-xl transition-colors duration-300 group-hover/svc:text-brand">
          {service.title}
        </h3>

        <p className="mt-2.5 flex-1 text-[0.96875rem] text-muted">
          {service.shortDescription}
        </p>

        <span className="mt-[1.125rem] inline-flex items-center gap-1.5 font-head text-[0.90625rem] font-semibold text-navy transition-colors duration-300 group-hover/svc:text-brand">
          Detaylı bilgi
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover/svc:translate-x-1.5"
            aria-hidden
          />
        </span>
      </span>
    </Link>
  );
}
