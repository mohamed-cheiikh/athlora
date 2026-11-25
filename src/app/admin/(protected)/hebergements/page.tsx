import { requireAdmin } from "@/lib/auth/require-admin";
import { getHebergementsAdmin } from "@/lib/queries/admin/hebergements";
import { Link } from "@/i18n/navigation";
import { deleteHebergementAction, togglePublishHebergementAction } from "@/lib/actions/admin/hebergements";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default async function AdminHebergementsPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { items, total } = await getHebergementsAdmin(sp.search ?? "", Number(sp.page ?? 1), 20);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Hébergements</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{total} au total</p>
        </div>
        <Link href={"/admin/hebergements/new" as "/"} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90">
          <Plus size={16} /> Nouveau
        </Link>
      </div>
      <form method="GET" className="mb-4">
        <input type="text" name="search" defaultValue={sp.search ?? ""} placeholder="Rechercher…" className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]" />
      </form>
      <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center py-16 text-[var(--color-on-surface-variant)]">Aucun hébergement</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-container-low)] text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <tr>
                  <th className="px-5 py-3 text-start">Nom</th>
                  <th className="px-5 py-3 text-start">Type</th>
                  <th className="px-5 py-3 text-start">Zone</th>
                  <th className="px-5 py-3 text-start">Tarif</th>
                  <th className="px-5 py-3 text-start">Statut</th>
                  <th className="px-5 py-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                {items.map((h) => (
                  <tr key={h.id} className="hover:bg-[var(--color-surface-container-low)]">
                    <td className="px-5 py-3 text-sm font-semibold text-[var(--color-on-surface)] max-w-[200px] truncate">
                      {h.nomFr}
                      {!h.nomAr && <span className="ms-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">AR manquant</span>}
                    </td>
                    <td className="px-5 py-3 text-xs font-bold uppercase text-[var(--color-on-surface-variant)]">{h.type}</td>
                    <td className="px-5 py-3 text-sm text-[var(--color-on-surface-variant)]">{h.zone}</td>
                    <td className="px-5 py-3 text-sm text-[var(--color-on-surface-variant)]">{h.tarifIndicatif ? `${h.tarifIndicatif} DA/nuit` : "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${h.publie ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {h.publie ? "Publié" : "Masqué"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/hebergements/${h.id}/edit` as "/"} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"><Pencil size={15} /></Link>
                        <form action={togglePublishHebergementAction.bind(null, h.id, !h.publie)}>
                          <button type="submit" className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]">
                            {h.publie ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </form>
                        <form action={deleteHebergementAction.bind(null, h.id)} onSubmit={(e) => { if (!confirm("Supprimer ?")) e.preventDefault(); }}>
                          <button type="submit" className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-on-surface-variant)] hover:text-red-600"><Trash2 size={15} /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
