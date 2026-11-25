import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getHebergementBySlug } from "@/lib/queries/hebergements";
import { ChevronLeft, MapPin, Phone, Mail, Globe, ExternalLink, Wifi, Car, Waves, Utensils, Wind, Coffee, Dumbbell, Sparkles } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const stay = await getHebergementBySlug(slug);
  if (!stay) return { title: "Hébergement introuvable" };
  const nom = locale === "ar" && stay.nomAr ? stay.nomAr : stay.nomFr;
  return { title: `${nom} | Athlora` };
}

const AMENITY_ICON: Record<string, React.ReactNode> = {
  wifi:            <Wifi size={16} />,
  parking:         <Car size={16} />,
  piscine:         <Waves size={16} />,
  restaurant:      <Utensils size={16} />,
  clim:            <Wind size={16} />,
  petit_dejeuner:  <Coffee size={16} />,
  salle_sport:     <Dumbbell size={16} />,
  spa:             <Sparkles size={16} />,
};

const TYPE_GRADIENT: Record<string, string> = {
  hotel:   "from-amber-500 to-orange-700",
  auberge: "from-green-500 to-emerald-700",
  motel:   "from-sky-400 to-indigo-600",
};

export default async function HebergementDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [stay, t] = await Promise.all([
    getHebergementBySlug(slug),
    getTranslations({ locale }),
  ]);

  if (!stay) notFound();

  const nom         = locale === "ar" && stay.nomAr         ? stay.nomAr         : stay.nomFr;
  const description = locale === "ar" && stay.descriptionAr ? stay.descriptionAr : stay.descriptionFr;
  const gradient = TYPE_GRADIENT[stay.type] ?? TYPE_GRADIENT.hotel;

  const mapsUrl = stay.mapsUrl
    ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stay.adresse} ${stay.zone} Algérie`)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-10">
      <Link
        href="/hebergements"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6"
      >
        <ChevronLeft size={16} />
        {t("common.back")}
      </Link>

      {/* Hero */}
      <div className={`relative rounded-3xl overflow-hidden h-64 md:h-80 bg-gradient-to-br ${gradient} mb-8`}>
        {stay.image && (
          <img src={stay.image} alt={nom} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 p-6 flex flex-col gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[var(--color-secondary)] text-white self-start">
            {t(`stays.${stay.type}` as "stays.hotel")}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{nom}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <p className="text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">{description}</p>

          {/* Commodités */}
          {stay.commodites.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-4">
                {t("stays.amenities")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stay.commodites.map((key) => (
                  <div key={key} className="flex items-center gap-2 text-sm text-[var(--color-on-surface)]">
                    <span className="text-[var(--color-secondary)]">{AMENITY_ICON[key] ?? null}</span>
                    {t(`stays.amenitiesList.${key}` as "stays.amenitiesList.wifi")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  {t("stays.address")}
                </p>
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">{stay.adresse}, {stay.zone}</p>
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

            {/* Phone */}
            {stay.telephone && (
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-[var(--color-secondary)]" />
                <a href={`tel:${stay.telephone}`} className="text-sm font-semibold text-[var(--color-on-surface)] hover:text-[var(--color-secondary)]">
                  <bdi dir="ltr">{stay.telephone}</bdi>
                </a>
              </div>
            )}

            {/* Email */}
            {stay.email && (
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[var(--color-secondary)]" />
                <a href={`mailto:${stay.email}`} className="text-sm font-semibold text-[var(--color-on-surface)] hover:text-[var(--color-secondary)]">
                  <bdi dir="ltr">{stay.email}</bdi>
                </a>
              </div>
            )}

            {/* Website */}
            {stay.siteWeb && (
              <div className="flex items-center gap-3">
                <Globe size={18} className="shrink-0 text-[var(--color-secondary)]" />
                <a
                  href={stay.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[var(--color-on-surface)] hover:text-[var(--color-secondary)] truncate"
                >
                  {t("stays.website")}
                </a>
              </div>
            )}

            {/* Booking CTA */}
            <div className="border-t border-[var(--color-outline-variant)] pt-4">
              {stay.tarifIndicatif && (
                <p className="text-2xl font-extrabold text-[var(--color-secondary)]">
                  {stay.tarifIndicatif.toLocaleString()} DA
                  <span className="text-sm font-semibold text-[var(--color-on-surface-variant)]">
                    {t("common.perNight")}
                  </span>
                </p>
              )}
              <a
                href="#reservation"
                className="mt-3 w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {t("stays.bookNow")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
