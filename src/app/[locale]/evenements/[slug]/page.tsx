import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getEvenementBySlug } from "@/lib/queries/evenements";
import { getHebergementsPourEvenement } from "@/lib/queries/hebergements";
import { StayCard } from "@/components/cards/StayCard";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";
import { Calendar, MapPin, Users, ChevronLeft, ExternalLink } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const event = await getEvenementBySlug(slug);
  if (!event) return { title: "Événement introuvable" };
  const t = await getTranslations({ locale, namespace: "seo" });
  const titre = locale === "ar" && event.titreAr ? event.titreAr : event.titreFr;
  const description = locale === "ar" && event.descriptionAr ? event.descriptionAr : event.descriptionFr;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athlora.com";
  const frUrl = `${base}/evenements/${slug}`;
  const arUrl = `${base}/ar/evenements/${slug}`;
  return {
    title: `${titre} | Athlora`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${titre} | Athlora`,
      description: description.slice(0, 160),
      url: locale === "ar" ? arUrl : frUrl,
      ...(event.image ? { images: [{ url: event.image, alt: titre }] } : {}),
    },
    alternates: {
      canonical: locale === "ar" ? arUrl : frUrl,
      languages: { fr: frUrl, ar: arUrl, "x-default": frUrl },
    },
  };
}

export default async function EvenementDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [event, t] = await Promise.all([
    getEvenementBySlug(slug),
    getTranslations({ locale }),
  ]);

  if (!event) notFound();

  const titre       = locale === "ar" && event.titreAr       ? event.titreAr       : event.titreFr;
  const description = locale === "ar" && event.descriptionAr ? event.descriptionAr : event.descriptionFr;
  const programme   = locale === "ar" && event.programmeAr   ? event.programmeAr   : (event.programmeFr ?? null);
  const conditions  = locale === "ar" && event.conditionsAr  ? event.conditionsAr  : (event.conditionsFr ?? null);
  const lieu        = locale === "ar" && event.lieuAr        ? event.lieuAr        : event.lieuFr;

  const isUpcoming = new Date(event.dateDebut) > new Date();

  const dateDebut = new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(event.dateDebut));

  const dateFin = event.dateFin
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
        day: "numeric", month: "long", year: "numeric",
      }).format(new Date(event.dateFin))
    : null;

  const nearbyStays = (await getHebergementsPourEvenement(event.id)).map((r) => r.hebergement);

  const mapsUrl = event.mapsUrl
    ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lieu} ${event.zone} Algérie`)}`;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athlora.com";
  const pageUrl = locale === "ar"
    ? `${base}/ar/evenements/${event.slug}`
    : `${base}/evenements/${event.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.titreFr,
    description: event.descriptionFr,
    startDate: new Date(event.dateDebut).toISOString(),
    ...(event.dateFin ? { endDate: new Date(event.dateFin).toISOString() } : {}),
    location: {
      "@type": "Place",
      name: event.lieuFr,
      address: { "@type": "PostalAddress", addressLocality: event.zone, addressCountry: "DZ" },
    },
    ...(event.prix != null ? { offers: { "@type": "Offer", price: event.prix, priceCurrency: "DZD" } } : {}),
    ...(event.image ? { image: event.image } : {}),
    url: pageUrl,
  };

  const jsonLdStr = JSON.stringify(jsonLd).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return (
    <>
      {/* JSON-LD — safe: HTML chars escaped, no user HTML rendered */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdStr }} />
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-10">
      {/* Back */}
      <Link
        href="/evenements"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6"
      >
        <ChevronLeft size={16} />
        {t("common.back")}
      </Link>

      {/* Hero */}
      <div className={`relative rounded-3xl overflow-hidden h-64 md:h-80 bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 mb-8`}>
        {event.image && (
          <img src={event.image} alt={titre} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 p-6 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[var(--color-secondary)] text-white">
              {t(`enums.sportType.${event.sportType}` as "enums.sportType.course")}
            </span>
            {event.aLaUne && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30">
                {t("common.featured")}
              </span>
            )}
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
              isUpcoming ? "bg-green-600 text-white" : "bg-black/50 text-white/70"
            }`}>
              {isUpcoming ? t("common.upcoming") : t("common.past")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{titre}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <p className="text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {programme && (
            <Section title={t("events.program")}>
              <p className="text-sm text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">{programme}</p>
            </Section>
          )}

          {conditions && (
            <Section title={t("events.conditions")}>
              <p className="text-sm text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">{conditions}</p>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Info card */}
          <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  {t("events.startDate")}
                </p>
                <bdi dir="ltr" className="text-sm font-semibold text-[var(--color-on-surface)]">{dateDebut}</bdi>
                {dateFin && (
                  <>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-2">
                      {t("events.endDate")}
                    </p>
                    <bdi dir="ltr" className="text-sm font-semibold text-[var(--color-on-surface)]">{dateFin}</bdi>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">{t("stays.address")}</p>
                <p className="text-sm font-semibold text-[var(--color-on-surface)]">{lieu}, {event.zone}</p>
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

            {event.placesMax && (
              <div className="flex items-start gap-3">
                <Users size={18} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">{t("events.maxPlaces")}</p>
                  <p className="text-sm font-semibold text-[var(--color-on-surface)]">{event.placesMax} {t("common.places")}</p>
                </div>
              </div>
            )}

            <div className="border-t border-[var(--color-outline-variant)] pt-4">
              <p className="text-2xl font-extrabold text-[var(--color-secondary)]">
                {event.prix ? `${event.prix.toLocaleString()} DA` : t("common.free")}
              </p>
              {/* scrolled to by the register button above */}
            </div>
          </div>
        </div>
      </div>

      {/* Registration form */}
      {isUpcoming && (
        <div className="mt-10 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-6">
          <h2 className="text-xl font-extrabold text-[var(--color-on-surface)] mb-6 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[var(--color-secondary)]" />
            {t("events.registerNow")}
          </h2>
          <EventRegistrationForm eventId={event.id} eventTitle={event.titreFr} />
        </div>
      )}

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
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-3">{title}</h2>
      {children}
    </div>
  );
}
