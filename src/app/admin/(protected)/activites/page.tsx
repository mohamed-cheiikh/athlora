import { requireAdmin } from "@/lib/auth/require-admin";
import { getActivitesAdmin } from "@/lib/queries/admin/activites";
import Link from "next/link";
import { deleteActiviteAction, togglePublishActiviteAction } from "@/lib/actions/admin/activites";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { DeleteForm } from "@/components/admin/DeleteForm";

export default async function AdminActivitesPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { items, total } = await getActivitesAdmin(sp.search ?? "", Number(sp.page ?? 1), 20);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Activités</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{total} au total</p>
        </div>
        <Link href={"/admin/activites/new"} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90">
          <Plus size={16} /> Nouvelle
        </Link>
      </div>
      <form method="GET" className="mb-4">
        <input type="text" name="search" defaultValue={sp.search ?? ""} placeholder="Rechercher…" className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]" />
      </form>
      <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center py-16 text-[var(--color-on-surface-variant)]">Aucune activité</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-container-low)] text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <tr>
                  <th className="px-5 py-3 text-start">Titre</th>
                  <th className="px-5 py-3 text-start">Catégorie</th>
                  <th className="px-5 py-3 text-start">Zone</th>
                  <th className="px-5 py-3 text-start">Statut</th>
                  <th className="px-5 py-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                {items.map((act) => (
                  <tr key={act.id} className="hover:bg-[var(--color-surface-container-low)]">
                    <td className="px-5 py-3 text-sm font-semibold text-[var(--color-on-surface)] max-w-[220px] truncate">
                      {act.titreFr}
                      {!act.titreAr && <span className="ms-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">AR manquant</span>}
                    </td>
                    <td className="px-5 py-3 text-xs font-bold uppercase text-[var(--color-on-surface-variant)]">{act.categoriePrincipale} / {act.sousCategorie}</td>
                    <td className="px-5 py-3 text-sm text-[var(--color-on-surface-variant)]">{act.zone}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${act.publie ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {act.publie ? "Publié" : "Masqué"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/activites/${act.id}/edit`} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"><Pencil size={15} /></Link>
                        <form action={togglePublishActiviteAction.bind(null, act.id, !act.publie)}>
                          <button type="submit" className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]">
                            {act.publie ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </form>
                        <DeleteForm action={deleteActiviteAction.bind(null, act.id)} />
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
