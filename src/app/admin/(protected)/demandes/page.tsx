import { requireAdmin } from "@/lib/auth/require-admin";
import { getDemandesAdmin } from "@/lib/queries/admin/demandes";
import { updateStatutAction } from "@/lib/actions/admin/demandes";
import { Phone } from "lucide-react";

const STATUTS = [
  { value: "en_attente", label: "En attente", color: "bg-amber-100 text-amber-700" },
  { value: "confirme",   label: "Confirmé",   color: "bg-green-100 text-green-700" },
  { value: "annule",     label: "Annulé",     color: "bg-red-100 text-red-700" },
];

export default async function AdminDemandesPage({ searchParams }: { searchParams: Promise<{ statut?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { items, total } = await getDemandesAdmin(sp.statut, Number(sp.page ?? 1), 20);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Demandes de réservation</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">{total} au total</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "", label: "Toutes" }, ...STATUTS].map(({ value, label }) => (
          <a
            key={value}
            href={value ? `?statut=${value}` : "?"}
            className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
              sp.statut === value || (!sp.statut && !value)
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : `border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]`
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-10 text-center text-[var(--color-on-surface-variant)]">
            Aucune demande
          </div>
        ) : items.map((d) => {
          const statut = STATUTS.find((s) => s.value === d.statut);
          return (
            <div key={d.id} className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-[var(--color-on-surface)]">{d.nomClient}</span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${statut?.color ?? "bg-gray-100 text-gray-600"}`}>
                      {statut?.label ?? d.statut}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-[var(--color-on-surface-variant)] px-2 py-0.5 rounded-full bg-[var(--color-surface-container-low)]">
                      {d.typeCible}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5">{d.cibleTitre}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <a href={`tel:${d.telephone}`} className="flex items-center gap-1.5 text-[var(--color-secondary)] hover:underline font-semibold">
                      <Phone size={13} /> <bdi dir="ltr">{d.telephone}</bdi>
                    </a>
                    {d.dateSouhaitee && (
                      <span className="text-[var(--color-on-surface-variant)]">
                        📅 {new Date(d.dateSouhaitee).toLocaleDateString("fr-DZ")}
                        {d.dateFin && ` → ${new Date(d.dateFin).toLocaleDateString("fr-DZ")}`}
                      </span>
                    )}
                    <span className="text-[var(--color-on-surface-variant)]">👥 {d.nbPersonnes} pers.</span>
                  </div>
                  {d.remarques && <p className="text-xs text-[var(--color-on-surface-variant)] mt-2 italic">{d.remarques}</p>}
                </div>

                <div className="flex flex-col gap-2 text-xs">
                  <p className="text-[var(--color-on-surface-variant)] text-right">{new Date(d.createdAt).toLocaleDateString("fr-DZ")}</p>
                  <div className="flex gap-2">
                    {STATUTS.map((s) => (
                      <form key={s.value} action={updateStatutAction.bind(null, d.id, s.value as "en_attente" | "confirme" | "annule", undefined)}>
                        <button
                          type="submit"
                          disabled={d.statut === s.value}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            d.statut === s.value
                              ? `${s.color} opacity-70 cursor-default`
                              : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)]"
                          }`}
                        >
                          {s.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
