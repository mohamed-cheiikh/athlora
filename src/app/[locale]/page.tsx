import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getEvenementsALaUne } from "@/lib/queries/evenements";
import { getActivitesSport, getActivitesTourisme } from "@/lib/queries/activites";
import { getHebergementsAccueil } from "@/lib/queries/hebergements";
import { EventCard } from "@/components/cards/EventCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { StayCard } from "@/components/cards/StayCard";
import { Mountain, Heart, Users } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athlora.com";
  return {
    title: t("siteTitle"),
    description: t("siteDescription"),
    alternates: {
      canonical: locale === "ar" ? `${base}/ar` : base,
      languages: { fr: base, ar: `${base}/ar`, "x-default": base },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, featuredEvents, sportActivities, tourismActivities, stays] = await Promise.all([
    getTranslations({ locale }),
    getEvenementsALaUne(3),
    getActivitesSport(4),
    getActivitesTourisme(4),
    getHebergementsAccueil(3),
  ]);

  const values = [
    { icon: <Heart className="w-6 h-6 text-[var(--color-secondary)]" />, titleKey: "home.value1Title" as const, descKey: "home.value1Desc" as const },
    { icon: <Mountain className="w-6 h-6 text-[var(--color-secondary)]" />, titleKey: "home.value2Title" as const, descKey: "home.value2Desc" as const },
    { icon: <Users className="w-6 h-6 text-[var(--color-secondary)]" />, titleKey: "home.value3Title" as const, descKey: "home.value3Desc" as const },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-[var(--color-primary)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #FF5E00 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 40%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)] py-24 md:py-36 flex flex-col gap-6 items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30">
            <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-secondary)]">
              Alger • Oran • Mostaganem
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl">
            {t("home.heroTitle")}
          </h1>
          <p className="text-lg text-white/70 max-w-xl leading-relaxed">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/evenements"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-orange-900/30"
            >
              {t("home.discoverEvents")}
            </Link>
            <Link
              href="/activites"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              {t("home.exploreActivities")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Événements à la une ─────────────────────────────────────── */}
      {featuredEvents.length > 0 && (
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)]">
          <SectionHeader
            title={t("home.featuredEvents")}
            linkHref="/evenements"
            linkLabel={t("home.seeAllEvents")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ── Activités sportives ─────────────────────────────────────── */}
      {sportActivities.length > 0 && (
        <section className="py-16 md:py-20 bg-[var(--color-surface-container-low)]">
          <div className="max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)]">
            <SectionHeader
              title={t("home.sportActivities")}
              linkHref="/activites"
              linkLabel={t("home.seeAll")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {sportActivities.map((act) => (
                <ActivityCard key={act.id} activity={act} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Activités touristiques ──────────────────────────────────── */}
      {tourismActivities.length > 0 && (
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)]">
          <SectionHeader
            title={t("home.tourismActivities")}
            linkHref="/activites"
            linkLabel={t("home.seeAll")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {tourismActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ── Hébergements ────────────────────────────────────────────── */}
      {stays.length > 0 && (
        <section className="py-16 md:py-20 bg-[var(--color-surface-container-low)]">
          <div className="max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)]">
            <SectionHeader
              title={t("home.ourStays")}
              linkHref="/hebergements"
              linkLabel={t("home.seeAllStays")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {stays.map((stay) => (
                <StayCard key={stay.id} stay={stay} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Valeurs ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)]">
        <SectionHeader title={t("home.ourValues")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {values.map(({ icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-6 flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center">
                {icon}
              </div>
              <h3 className="font-extrabold text-[var(--color-on-surface)] text-lg">
                {t(titleKey)}
              </h3>
              <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  title,
  linkHref,
  linkLabel,
}: {
  title: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-[var(--color-secondary)]" />
        <h2 className="text-2xl font-extrabold text-[var(--color-on-surface)]">{title}</h2>
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref as "/"}
          className="text-sm font-bold text-[var(--color-secondary)] hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
