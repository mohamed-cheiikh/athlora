import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-on-primary)] mt-auto">
      <div className="max-w-7xl mx-auto px-[var(--spacing-space-lg)] lg:px-[var(--spacing-margin)] py-[var(--spacing-space-xl)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-space-xl)]">

          {/* Col 1 — Marque */}
          <div className="flex flex-col gap-[var(--spacing-space-md)]">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 px-3 py-1 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="font-extrabold text-base tracking-tight">ATHLORA</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-secondary)]">
                Mostaganem
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              {t("seo.siteDescription")}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Liens rapides */}
          <div className="flex flex-col gap-[var(--spacing-space-md)]">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-secondary)]">
              {t("footer.quickLinks")}
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { key: "nav.home", href: "/" },
                { key: "nav.events", href: "/evenements" },
                { key: "nav.activities", href: "/activites" },
                { key: "nav.stays", href: "/hebergements" },
                { key: "nav.contact", href: "/contact" },
              ].map(({ key, href }) => (
                <Link
                  key={key}
                  href={href as "/"}
                  className="text-sm text-white/70 hover:text-[var(--color-secondary)] transition-colors"
                >
                  {t(key as "nav.home")}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Contact */}
          <div className="flex flex-col gap-[var(--spacing-space-md)]">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-secondary)]">
              {t("footer.contactUs")}
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+213XXXXXXXXX"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-[var(--color-secondary)] transition-colors"
              >
                <Phone size={15} className="shrink-0 text-[var(--color-secondary)]" />
                <bdi dir="ltr">+213 XXX XXX XXX</bdi>
              </a>
              <a
                href="mailto:contact@athlora.dz"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-[var(--color-secondary)] transition-colors"
              >
                <Mail size={15} className="shrink-0 text-[var(--color-secondary)]" />
                <bdi dir="ltr">contact@athlora.dz</bdi>
              </a>
              <div className="flex items-start gap-2 text-sm text-white/70">
                <MapPin size={15} className="shrink-0 text-[var(--color-secondary)] mt-0.5" />
                <span>Mostaganem, Algérie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de bas */}
        <div className="mt-[var(--spacing-space-xl)] pt-[var(--spacing-space-md)] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Athlora. {t("footer.rights")}.</span>
          <span>Mostaganem • Algérie</span>
        </div>
      </div>
    </footer>
  );
}
