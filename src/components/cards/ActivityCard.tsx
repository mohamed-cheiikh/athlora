import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin, Clock } from "lucide-react";
import type { Activite } from "@/db/schema";

const CATEGORY_GRADIENT: Record<string, string> = {
  sport:    "from-blue-500 to-indigo-700",
  tourisme: "from-teal-500 to-emerald-700",
};

export async function ActivityCard({ activity, locale }: { activity: Activite; locale: string }) {
  const t = await getTranslations({ locale });
  const titre = locale === "ar" && activity.titreAr ? activity.titreAr : activity.titreFr;
  const duree = locale === "ar" && activity.dureeAr ? activity.dureeAr : (activity.dureeFr ?? null);
  const gradient = CATEGORY_GRADIENT[activity.categoriePrincipale] ?? CATEGORY_GRADIENT.sport;

  const catLabel = activity.categoriePrincipale === "sport"
    ? t("activities.sport")
    : t("activities.tourism");

  const sousCatKey = `activities.subCategories.${activity.sousCategorie}` as "activities.subCategories.course";
  const sousCatLabel = t(sousCatKey);

  return (
    <article className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-outline-variant)] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-end p-3`}>
        {activity.image && (
          <img src={activity.image} alt={titre} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        <div className="relative flex gap-2 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white border border-white/20">
            {catLabel}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/20">
            {sousCatLabel}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-[var(--color-on-surface)] text-base leading-snug line-clamp-2">
          {titre}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-[var(--color-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-[var(--color-secondary)]" />
            <span>{activity.lieuFr} — {activity.zone}</span>
          </div>
          {duree && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="shrink-0 text-[var(--color-secondary)]" />
              <span>{duree}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[var(--color-outline-variant)]">
          <span className="font-extrabold text-[var(--color-secondary)]">
            {activity.prix ? `${activity.prix.toLocaleString()} DA` : t("common.free")}
          </span>
          <Link
            href={`/activites/${activity.slug}` as "/"}
            className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
          >
            {t("common.seeDetails")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
