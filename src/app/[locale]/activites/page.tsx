import { setRequestLocale, getTranslations } from "next-intl/server";
import { getActivitesPubliees, type ActivityFilters } from "@/lib/queries/activites";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { ActivityFilters as ActivityFiltersBar } from "@/components/filters/ActivityFilters";
import { Suspense } from "react";

type SearchParams = { zone?: string; categorie?: string; page?: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return { title: `${t("activitiesTitle")} | Athlora`, description: t("siteDescription") };
}

export default async function ActivitesPage({
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
  const filters: ActivityFilters = {
    zone: sp.zone,
    categorie: sp.categorie as ActivityFilters["categorie"],
  };

  const { items, total, totalPages } = await getActivitesPubliees(filters, page, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)] py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-on-surface)]">
          {t("activities.title")}
        </h1>
        <p className="mt-2 text-[var(--color-on-surface-variant)]">{t("activities.subtitle")}</p>
      </div>

      <Suspense fallback={null}>
        <ActivityFiltersBar />
      </Suspense>

      <div className="mt-8">
        {items.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-on-surface-variant)]">
            {t("activities.noActivities")}
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              {total} résultat{total > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((act) => (
                <ActivityCard key={act.id} activity={act} locale={locale} />
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
      <span className="text-sm text-[var(--color-on-surface-variant)]">{page} / {totalPages}</span>
      {page < totalPages && (
        <a href={buildUrl(page + 1)} className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]">
          Suivant →
        </a>
      )}
    </div>
  );
}
