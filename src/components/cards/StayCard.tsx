import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin, Wifi, Car, Waves, Utensils, Wind, Coffee, Dumbbell, Sparkles } from "lucide-react";
import type { Hebergement } from "@/db/schema";

const TYPE_GRADIENT: Record<string, string> = {
  hotel:   "from-amber-500 to-orange-700",
  auberge: "from-green-500 to-emerald-700",
  motel:   "from-sky-400 to-indigo-600",
};

const AMENITY_ICON: Record<string, React.ReactNode> = {
  wifi:            <Wifi size={13} />,
  parking:         <Car size={13} />,
  piscine:         <Waves size={13} />,
  restaurant:      <Utensils size={13} />,
  clim:            <Wind size={13} />,
  petit_dejeuner:  <Coffee size={13} />,
  salle_sport:     <Dumbbell size={13} />,
  spa:             <Sparkles size={13} />,
};

export async function StayCard({ stay, locale }: { stay: Hebergement; locale: string }) {
  const t = await getTranslations({ locale });
  const nom = locale === "ar" && stay.nomAr ? stay.nomAr : stay.nomFr;
  const gradient = TYPE_GRADIENT[stay.type] ?? TYPE_GRADIENT.hotel;
  const typeLabel = t(`stays.${stay.type}` as "stays.hotel");
  const amenities = (stay.commodites ?? []).slice(0, 4);

  return (
    <article className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-end p-3`}>
        {stay.image && (
          <img src={stay.image} alt={nom} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        <span className="relative text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white border border-white/20">
          {typeLabel}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-[var(--color-on-surface)] text-base leading-snug line-clamp-2">
          {nom}
        </h3>

        <div className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
          <MapPin size={14} className="shrink-0 text-[var(--color-secondary)]" />
          <span className="line-clamp-1">{stay.adresse}, {stay.zone}</span>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]"
              >
                {AMENITY_ICON[key]}
                {t(`stays.amenitiesList.${key}` as "stays.amenitiesList.wifi")}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[var(--color-outline-variant)]">
          <span className="font-extrabold text-[var(--color-secondary)]">
            {stay.tarifIndicatif
              ? `${stay.tarifIndicatif.toLocaleString()} DA${t("common.perNight")}`
              : t("common.from")}
          </span>
          <Link
            href={`/hebergements/${stay.slug}` as "/"}
            className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
          >
            {t("common.seeDetails")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
