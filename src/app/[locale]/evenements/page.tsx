import { setRequestLocale, getTranslations } from "next-intl/server";
import { getEvenementsPublies, type EventFilters } from "@/lib/queries/evenements";
import { EventCard } from "@/components/cards/EventCard";
import { EventFilters as EventFiltersBar } from "@/components/filters/EventFilters";
import { Suspense } from "react";

type SearchParams = { zone?: string; sportType?: string; period?: string; page?: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return { title: `${t("eventsTitle")} | Athlora`, description: t("siteDescription") };
}

export default async function EvenementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const t = await getTranslations({ locale });
  const page = Number(sp.page ?? 1);
  const filters: EventFilters = {
    zone: sp.zone,
    sportType: sp.sportType,
    period: sp.period as EventFilters["period"],
  };

  const { items, total, totalPages } = await getEvenementsPublies(filters, page, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)] py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-on-surface)]">
          {t("events.title")}
        </h1>
        <p className="mt-2 text-[var(--color-on-surface-variant)]">{t("events.subtitle")}</p>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <EventFiltersBar />
      </Suspense>

      {/* Grid */}
      <div className="mt-8">
        {items.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-on-surface-variant)]">
            {t("events.noEvents")}
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              {total} résultat{total > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((event) => (
                <EventCard key={event.id} event={event} locale={locale} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} searchParams={sp} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: SearchParams }) {
  function buildUrl(p: number) {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 && (
        <a href={buildUrl(page - 1)} className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]">
          ← Précédent
        </a>
      )}
      <span className="text-sm text-[var(--color-on-surface-variant)]">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <a href={buildUrl(page + 1)} className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]">
          Suivant →
        </a>
      )}
    </div>
  );
}
