import { requireAdmin } from "@/lib/auth/require-admin";
import { getEvenementsAdmin } from "@/lib/queries/admin/evenements";
import { Link } from "@/i18n/navigation";
import { deleteEvenementAction, togglePublishEvenementAction } from "@/lib/actions/admin/evenements";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default async function AdminEvenementsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = Number(sp.page ?? 1);
  const { items, total } = await getEvenementsAdmin(search, page, 20);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Événements</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{total} au total</p>
        </div>
        <Link
          href={"/admin/evenements/new" as "/"}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-secondary)] text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nouveau
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Rechercher…"
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
        />
      </form>

      <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center py-16 text-[var(--color-on-surface-variant)]">Aucun événement</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-container-low)] text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <tr>
                  <th className="px-5 py-3 text-start">Titre</th>
                  <th className="px-5 py-3 text-start">Sport</th>
                  <th className="px-5 py-3 text-start">Zone</th>
                  <th className="px-5 py-3 text-start">Date</th>
                  <th className="px-5 py-3 text-start">Statut</th>
                  <th className="px-5 py-3 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                {items.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[var(--color-surface-container-low)]">
                    <td className="px-5 py-3 text-sm font-semibold text-[var(--color-on-surface)] max-w-[220px] truncate">
                      {ev.titreFr}
                      {!ev.titreAr && (
                        <span className="ms-2 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">AR manquant</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs font-bold uppercase text-[var(--color-on-surface-variant)]">{ev.sportType}</td>
                    <td className="px-5 py-3 text-sm text-[var(--color-on-surface-variant)]">{ev.zone}</td>
                    <td className="px-5 py-3 text-xs text-[var(--color-on-surface-variant)]">
                      {new Date(ev.dateDebut).toLocaleDateString("fr-DZ")}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        ev.publie ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {ev.publie ? "Publié" : "Masqué"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/evenements/${ev.id}/edit` as "/"}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </Link>
                        <TogglePublishButton id={ev.id} publie={ev.publie} />
                        <DeleteButton id={ev.id} />
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

function TogglePublishButton({ id, publie }: { id: number; publie: boolean }) {
  const action = togglePublishEvenementAction.bind(null, id, !publie);
  return (
    <form action={action}>
      <button
        type="submit"
        title={publie ? "Masquer" : "Publier"}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)]"
      >
        {publie ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </form>
  );
}

function DeleteButton({ id }: { id: number }) {
  const action = deleteEvenementAction.bind(null, id);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm("Supprimer définitivement ?")) e.preventDefault(); }}>
      <button
        type="submit"
        title="Supprimer"
        className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-on-surface-variant)] hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}
