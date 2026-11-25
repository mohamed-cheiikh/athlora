import { requireAdmin } from "@/lib/auth/require-admin";
import { getMessagesAdmin } from "@/lib/queries/admin/messages";
import { markLuAction, markAllLuAction } from "@/lib/actions/admin/messages";
import { Mail, MailOpen, Phone } from "lucide-react";

const SUJETS: Record<string, string> = {
  question_generale: "Question générale",
  partenariat:       "Partenariat",
  assistance:        "Assistance",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ lu?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const luFilter = sp.lu === "true" ? true : sp.lu === "false" ? false : undefined;
  const { items, total } = await getMessagesAdmin(luFilter, Number(sp.page ?? 1), 20);
  const nonLus = items.filter((m) => !m.lu).length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Messages de contact</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{total} au total</p>
        </div>
        {nonLus > 0 && (
          <form action={markAllLuAction}>
            <button
              type="submit"
              className="text-xs font-bold px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors"
            >
              Tout marquer comme lu ({nonLus})
            </button>
          </form>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: "",      label: "Tous" },
          { value: "false", label: "Non lus" },
          { value: "true",  label: "Lus" },
        ].map(({ value, label }) => (
          <a
            key={value}
            href={value ? `?lu=${value}` : "?"}
            className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
              sp.lu === value || (!sp.lu && !value)
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-10 text-center text-[var(--color-on-surface-variant)]">
            Aucun message
          </div>
        ) : (
          items.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border p-5 ${m.lu ? "border-[var(--color-outline-variant)]" : "border-[var(--color-secondary)] ring-1 ring-[var(--color-secondary)]"}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-extrabold text-[var(--color-on-surface)]">{m.nom}</span>
                    {!m.lu && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-white">
                        Nouveau
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]">
                      {SUJETS[m.sujet] ?? m.sujet}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <a href={`mailto:${m.email}`} className="text-[var(--color-secondary)] hover:underline font-semibold">
                      {m.email}
                    </a>
                    {m.telephone && (
                      <a href={`tel:${m.telephone}`} className="flex items-center gap-1 text-[var(--color-secondary)] hover:underline font-semibold">
                        <Phone size={13} /> <bdi dir="ltr">{m.telephone}</bdi>
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-[var(--color-on-surface)] whitespace-pre-line leading-relaxed">{m.message}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    {new Date(m.createdAt).toLocaleDateString("fr-DZ")}
                  </p>
                  {!m.lu && (
                    <form action={markLuAction.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] transition-colors"
                      >
                        <MailOpen size={12} /> Marquer lu
                      </button>
                    </form>
                  )}
                  {m.lu && <MailOpen size={15} className="text-[var(--color-on-surface-variant)] opacity-40" />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
