"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Menu, X, Lock } from "lucide-react";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "events", href: "/evenements" },
  { key: "activities", href: "/activites" },
  { key: "stays", href: "/hebergements" },
  { key: "contact", href: "/contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function switchLocale(next: "fr" | "ar") {
    router.replace(pathname, { locale: next });
  }

  return (
    <header className="fixed top-0 start-0 end-0 w-full z-50 bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(10,27,58,0.06)] border-b border-[var(--color-surface-container-high)]/60">
      <div className="h-20 w-full px-[var(--spacing-space-lg)] lg:px-[var(--spacing-margin)] flex items-center justify-between gap-[var(--spacing-space-md)]">

        {/* Logo + badge ville */}
        <div className="flex items-center gap-[var(--spacing-space-sm)]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 px-3 py-1 rounded-xl bg-white shadow-sm border border-[var(--color-outline-variant)]/30 flex items-center justify-center">
              <span className="font-extrabold text-lg text-[var(--color-primary)] tracking-tight">
                ATHLORA
              </span>
            </div>
          </Link>
          <span className="hidden xl:inline-flex items-center px-[var(--spacing-space-xs)] py-0.5 rounded-full bg-orange-100 text-[var(--color-secondary)] border border-orange-200 text-[10px] font-extrabold uppercase tracking-wider ms-[var(--spacing-space-xs)]">
            Algérie
          </span>
        </div>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-[var(--spacing-space-xs)] p-1 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-surface-container-high)]">
          {NAV_LINKS.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={`px-[var(--spacing-space-md)] py-[var(--spacing-space-sm)] text-[14px] font-bold tracking-wide rounded-xl transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-sm"
                    : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-[var(--spacing-space-sm)]">
          {/* Sélecteur FR/AR */}
          <div className="flex items-center p-1 rounded-full bg-[var(--color-surface-container)] border border-[var(--color-surface-container-high)]">
            {(["fr", "ar"] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`px-[var(--spacing-space-sm)] py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                  locale === loc
                    ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary)] shadow-sm"
                    : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
                }`}
              >
                {loc === "fr" ? "FR" : "عربي"}
              </button>
            ))}
          </div>

          {/* Lien Admin */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-[var(--spacing-space-xs)] px-[var(--spacing-space-md)] py-[var(--spacing-space-sm)] rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[14px] font-bold tracking-wide transition-transform hover:scale-[1.02] shadow-sm hover:bg-[var(--color-primary-container)]"
          >
            <Lock size={16} className="text-[var(--color-secondary)]" />
            <span>{t("admin")}</span>
          </Link>

          {/* Burger mobile */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="lg:hidden w-9 h-9 rounded-full bg-[var(--color-surface-container)] flex items-center justify-center border border-[var(--color-surface-container-high)]"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menu mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--color-surface-container-high)] bg-[var(--color-surface)] px-[var(--spacing-space-lg)] py-[var(--spacing-space-md)] flex flex-col gap-1">
          {NAV_LINKS.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-[var(--spacing-space-md)] py-[var(--spacing-space-sm)] rounded-xl text-[14px] font-bold transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary)]"
                    : "text-[var(--color-on-surface)] hover:text-[var(--color-secondary)] hover:bg-[var(--color-surface-container-low)]"
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-flex items-center gap-2 px-[var(--spacing-space-md)] py-[var(--spacing-space-sm)] rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[14px] font-bold"
          >
            <Lock size={16} className="text-[var(--color-secondary)]" />
            {t("admin")}
          </Link>
        </div>
      )}
    </header>
  );
}
