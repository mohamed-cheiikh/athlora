import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getActiviteBySlug } from "@/lib/queries/activites";
import { getHebergementsPourActivite } from "@/lib/queries/hebergements";
import { StayCard } from "@/components/cards/StayCard";
import { MapPin, Clock, Package, ChevronLeft, ExternalLink, Phone, Mail } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const activity = await getActiviteBySlug(slug);
  if (!activity) return { title: "Activité introuvable" };
  const titre = locale === "ar" && activity.titreAr ? activity.titreAr : activity.titreFr;
  return { title: `${titre} | Athlora` };
}

export default async function ActiviteDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [activity, t] = await Promise.all([
    getActiviteBySlug(slug),
    getTranslations({ locale }),
  ]);

  if (!activity) notFound();

  const titre       = locale === "ar" && activity.titreAr       ? activity.titreAr       : activity.titreFr;
  const description = locale === "ar" && activity.descriptionAr ? activity.descriptionAr : activity.descriptionFr;
  const duree       = locale === "ar" && activity.dureeAr       ? activity.dureeAr       : (activity.dureeFr ?? null);
  const equipement  = locale === "ar" && activity.equipementAr  ? activity.equipementAr  : (activity.equipementFr ?? null);
  const lieu        = locale === "ar" && activity.lieuAr        ? activity.lieuAr        : activity.lieuFr;

  const mapsUrl = activity.mapsUrl
    ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lieu} ${activity.zone} Algérie`)}`;

  const nearbyStays = (await getHebergementsPourActivite(activity.id)).map((r) => r.hebergement);

  const catLabel = activity.categoriePrincipale === "sport" ? t("activities.sport") : t("activities.tourism");
  const sousCatKey = `activities.subCategories.${activity.sousCategorie}` as "activities.subCategories.course";

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-10">
      <Link
        href="/activites"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6"
      >
        <ChevronLeft size={16} />
        {t("common.back")}
      </Link>

      {/* Hero */}
      <div className={`relative rounded-3xl overflow-hidden h-64 md:h-80 bg-gradient-to-br ${
        activity.categoriePrincipale === "sport" ? "from-blue-600 to-indigo-800" : "from-teal-500 to-emerald-800"
      } mb-8`}>
        {activity.image && (
          <img src={activity.image} alt={titre} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 p-6 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[var(--color-secondary)] text-white">
              {catLabel}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30">
              {t(sousCatKey)}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{titre}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <p className="text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">{description}</p>

          {equipement && (
            <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-3 flex items-center gap-2">
                <Package size={15} />
                {t("activities.equipment")}
              </h2>
              <p className="text-sm text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">{equipement}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  {t("stays.address")}
                </p>
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">{lieu}, {activity.zone}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-secondary)] hover:underline mt-1"
                >
                  <ExternalLink size={12} />
                  {t("common.viewOnMap")}
                </a>
              </div>
            </div>

            {duree && (
              <div className="flex items-start gap-3">
                <Clock size={18} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    {t("activities.duration")}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-on-surface)]">{duree}</p>
                </div>
              </div>
            )}

            {activity.contactOrganisateurNom && (
              <div className="border-t border-[var(--color-outline-variant)] pt-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                  {t("activities.organizer")}
                </p>
                <p className="text-sm font-bold text-[var(--color-on-surface)]">{activity.contactOrganisateurNom}</p>
                {activity.contactOrganisateurTel && (
                  <a href={`tel:${activity.contactOrganisateurTel}`} className="flex items-center gap-1.5 text-sm text-[var(--color-secondary)] hover:underline mt-1">
                    <Phone size={13} />
                    <bdi dir="ltr">{activity.contactOrganisateurTel}</bdi>
                  </a>
                )}
                {activity.contactOrganisateurEmail && (
                  <a href={`mailto:${activity.contactOrganisateurEmail}`} className="flex items-center gap-1.5 text-sm text-[var(--color-secondary)] hover:underline mt-1">
                    <Mail size={13} />
                    <bdi dir="ltr">{activity.contactOrganisateurEmail}</bdi>
                  </a>
                )}
              </div>
            )}

            <div className="border-t border-[var(--color-outline-variant)] pt-4">
              <p className="text-2xl font-extrabold text-[var(--color-secondary)]">
                {activity.prix ? `${activity.prix.toLocaleString()} DA` : t("common.free")}
              </p>
              <a
                href="#reservation"
                className="mt-3 w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {t("activities.bookNow")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby stays */}
      {nearbyStays.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold text-[var(--color-on-surface)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[var(--color-secondary)]" />
            {t("events.nearbyStays")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyStays.map((stay) => (
              <StayCard key={stay.id} stay={stay} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
