"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SPORT_TYPES = ["course", "randonnee", "cyclisme", "natation", "trail", "autre"] as const;
const ZONES = ["Alger", "Oran", "Mostaganem"] as const;
const PERIODS = ["all", "upcoming", "past"] as const;

export function EventFilters() {
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
  const sportType = sp.get("sportType") ?? "";
  const period    = sp.get("period")    ?? "all";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]">
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

      {/* Sport type */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
          {t("events.filterSport")}
        </label>
        <select
          value={sportType}
          onChange={(e) => update("sportType", e.target.value)}
          className="text-sm font-semibold px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        >
          <option value="">{t("events.allSports")}</option>
          {SPORT_TYPES.map((s) => (
            <option key={s} value={s}>{t(`enums.sportType.${s}`)}</option>
          ))}
        </select>
      </div>

      {/* Period */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
          {t("events.filterPeriod")}
        </label>
        <div className="flex rounded-xl border border-[var(--color-outline-variant)] overflow-hidden bg-[var(--color-surface)]">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => update("period", p === "all" ? "" : p)}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                period === p || (period === "" && p === "all")
                  ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary)]"
                  : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
              }`}
            >
              {t(`events.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {(zone || sportType || (period && period !== "all")) && (
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
