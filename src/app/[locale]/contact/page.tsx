import { setRequestLocale, getTranslations } from "next-intl/server";
import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return { title: `${t("contactTitle")} | Athlora`, description: t("siteDescription") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-[var(--spacing-margin)] py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-on-surface)]">
          {t("contact.title")}
        </h1>
        <p className="mt-3 text-[var(--color-on-surface-variant)] max-w-xl mx-auto">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="flex flex-col gap-4">
          <ContactCard
            icon={<Phone size={20} className="text-[var(--color-secondary)]" />}
            label={t("contact.phone")}
            value="+213 XXX XXX XXX"
            href="tel:+213XXXXXXXXX"
          />
          <ContactCard
            icon={<Mail size={20} className="text-[var(--color-secondary)]" />}
            label={t("contact.email")}
            value="contact@athlora.dz"
            href="mailto:contact@athlora.dz"
          />
          <ContactCard
            icon={<MapPin size={20} className="text-[var(--color-secondary)]" />}
            label={t("contact.address")}
            value="Algérie — Alger • Oran • Mostaganem"
          />
          <ContactCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-secondary)]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            }
            label={t("contact.whatsapp")}
            value="+213 XXX XXX XXX"
            href="https://wa.me/213XXXXXXXXX"
          />
        </div>

        {/* Contact form */}
        <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6">
          <h2 className="text-lg font-extrabold text-[var(--color-on-surface)] mb-5">
            {t("contact.title")}
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon, label, value, href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
          {label}
        </p>
        <bdi dir="ltr" className="text-sm font-semibold text-[var(--color-on-surface)] mt-0.5 block">
          {value}
        </bdi>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}
