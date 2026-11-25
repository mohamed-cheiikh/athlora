import { setRequestLocale, getTranslations } from "next-intl/server";
import { getHebergementsPublies, type StayFilters } from "@/lib/queries/hebergements";
import { StayCard } from "@/components/cards/StayCard";
import { StayFilters as StayFiltersBar } from "@/components/filters/StayFilters";
import { Suspense } from "react";

type SearchParams = { zone?: string; type?: string; page?: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athlora.com";
  return {
    title: `${t("staysTitle")} | Athlora`,
    description: t("siteDescription"),
    alternates: {
      canonical: `${locale === "ar" ? `${base}/ar` : base}/hebergements`,
      languages: { fr: `${base}/hebergements`, ar: `${base}/ar/hebergements`, "x-default": `${base}/hebergements` },
    },
  };
}

export default async function HebergementsPage({
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
  const filters: StayFilters = { zone: sp.zone, type: sp.type };

  const { items, total, totalPages } = await getHebergementsPublies(filters, page, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-[var(--spacing-margin)] py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-on-surface)]">
          {t("stays.title")}
        </h1>
        <p className="mt-2 text-[var(--color-on-surface-variant)]">{t("stays.subtitle")}</p>
      </div>

      <Suspense fallback={null}>
        <StayFiltersBar />
      </Suspense>

      <div className="mt-8">
        {items.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-on-surface-variant)]">
            {t("stays.noStays")}
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              {total} résultat{total > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((stay) => (
                <StayCard key={stay.id} stay={stay} locale={locale} />
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
