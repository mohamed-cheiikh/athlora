"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const ZONES = ["Alger", "Oran", "Mostaganem"] as const;
const CATEGORIES = ["sport", "tourisme"] as const;

export function ActivityFilters() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}` as "/");
  }

  function reset() {
    router.push(pathname as "/");
  }

  const zone      = sp.get("zone")      ?? "";
  const categorie = sp.get("categorie") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
      {/* Category tabs */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
          {t("activities.title")}
        </label>
        <div className="flex rounded-xl border border-[var(--color-outline-variant)] overflow-hidden bg-[var(--color-surface)]">
          <button
            onClick={() => update("categorie", "")}
            className={`px-4 py-2 text-sm font-bold transition-colors ${
              !categorie
                ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary)]"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
            }`}
          >
            {t("events.all")}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => update("categorie", c)}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                categorie === c
                  ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary)]"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
              }`}
            >
              {t(`activities.${c}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Zone */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
          {t("events.filterZone")}
        </label>
        <select
          value={zone}
          onChange={(e) => update("zone", e.target.value)}
          className="text-sm font-semibold px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        >
          <option value="">{t("events.allZones")}</option>
          {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* Reset */}
      {(zone || categorie) && (
        <button
          onClick={reset}
          className="mt-auto text-sm font-bold text-[var(--color-secondary)] hover:underline"
        >
          {t("filters.reset")}
        </button>
      )}
    </div>
  );
}
