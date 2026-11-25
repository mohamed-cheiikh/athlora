import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Calendar, MapPin } from "lucide-react";
import type { Evenement } from "@/db/schema";

const SPORT_GRADIENT: Record<string, string> = {
  course:    "from-orange-400 to-red-600",
  randonnee: "from-emerald-500 to-teal-700",
  cyclisme:  "from-blue-500 to-indigo-700",
  natation:  "from-cyan-400 to-blue-600",
  trail:     "from-amber-500 to-orange-800",
  autre:     "from-slate-400 to-slate-600",
};

export async function EventCard({ event, locale }: { event: Evenement; locale: string }) {
  const t = await getTranslations({ locale });
  const titre = locale === "ar" && event.titreAr ? event.titreAr : event.titreFr;
  const lieu  = locale === "ar" && event.lieuAr  ? event.lieuAr  : event.lieuFr;
  const isUpcoming = new Date(event.dateDebut) > new Date();
  const gradient = SPORT_GRADIENT[event.sportType] ?? SPORT_GRADIENT.autre;

  const dateStr = new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(event.dateDebut));

  return (
    <article className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-end p-3`}>
        {event.image && (
          <img src={event.image} alt={titre} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        <div className="relative flex gap-2 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white border border-white/20">
            {t(`enums.sportType.${event.sportType}` as "enums.sportType.course")}
          </span>
          {event.aLaUne && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[var(--color-secondary)] text-white">
              {t("common.featured")}
            </span>
          )}
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
            isUpcoming ? "bg-green-600 text-white" : "bg-black/50 text-white/70"
          }`}>
            {isUpcoming ? t("common.upcoming") : t("common.past")}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-[var(--color-on-surface)] text-base leading-snug line-clamp-2">
          {titre}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0 text-[var(--color-secondary)]" />
            <bdi dir="ltr">{dateStr}</bdi>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-[var(--color-secondary)]" />
            <span className="line-clamp-1">{lieu} — {event.zone}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[var(--color-outline-variant)]">
          <span className="font-extrabold text-[var(--color-secondary)]">
            {event.prix ? `${event.prix.toLocaleString()} DA` : t("common.free")}
          </span>
          <Link
            href={`/evenements/${event.slug}` as "/"}
            className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
          >
            {t("common.seeDetails")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
