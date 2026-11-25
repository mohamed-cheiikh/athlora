import { requireAdmin } from "@/lib/auth/require-admin";
import { getDashboardStats, getRecentRequests } from "@/lib/queries/admin/dashboard";
import { CalendarDays, Layers, Building2, InboxIcon, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [stats, recentRequests] = await Promise.all([getDashboardStats(), getRecentRequests(5)]);

  const cards = [
    { label: "Événements",   value: stats.totalEvents,    icon: CalendarDays, href: "/admin/evenements", color: "bg-blue-500" },
    { label: "Activités",    value: stats.totalActivities, icon: Layers,       href: "/admin/activites",  color: "bg-teal-500" },
    { label: "Hébergements", value: stats.totalStays,      icon: Building2,    href: "/admin/hebergements", color: "bg-amber-500" },
    { label: "Demandes en attente", value: stats.pendingRequests, icon: InboxIcon, href: "/admin/demandes", color: "bg-orange-500" },
    { label: "Messages non lus", value: stats.unreadMessages, icon: MessageSquare, href: "/admin/messages", color: "bg-red-500" },
  ];

  const STATUT_LABEL: Record<string, string> = {
    en_attente: "En attente",
    confirme: "Confirmé",
    annule: "Annulé",
  };

  const STATUT_COLOR: Record<string, string> = {
    en_attente: "bg-amber-100 text-amber-700",
    confirme: "bg-green-100 text-green-700",
    annule: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl border border-[var(--color-outline-variant)] p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color}/10 flex items-center justify-center`}>
              <Icon size={20} className={`${color.replace("bg-", "text-")}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--color-on-surface)]">{value}</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] font-semibold">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-2xl border border-[var(--color-outline-variant)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-outline-variant)] flex items-center justify-between">
          <h2 className="font-extrabold text-[var(--color-on-surface)]">Demandes récentes</h2>
          <Link href={"/admin/demandes"} className="text-sm font-bold text-[var(--color-secondary)] hover:underline">
            Voir toutes →
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <p className="text-center py-10 text-[var(--color-on-surface-variant)] text-sm">Aucune demande</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-container-low)] text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <tr>
                  <th className="px-6 py-3 text-start">Client</th>
                  <th className="px-6 py-3 text-start">Concerne</th>
                  <th className="px-6 py-3 text-start">Téléphone</th>
                  <th className="px-6 py-3 text-start">Statut</th>
                  <th className="px-6 py-3 text-start">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline-variant)]">
                {recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--color-surface-container-low)] transition-colors">
                    <td className="px-6 py-3 text-sm font-semibold text-[var(--color-on-surface)]">{r.nomClient}</td>
                    <td className="px-6 py-3 text-sm text-[var(--color-on-surface-variant)] max-w-[200px] truncate">{r.cibleTitre}</td>
                    <td className="px-6 py-3 text-sm text-[var(--color-on-surface-variant)]">
                      <bdi dir="ltr">{r.telephone}</bdi>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUT_COLOR[r.statut] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUT_LABEL[r.statut] ?? r.statut}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-[var(--color-on-surface-variant)]">
                      {new Date(r.createdAt).toLocaleDateString("fr-DZ")}
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
