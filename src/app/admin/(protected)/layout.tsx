import { requireAdmin } from "@/lib/auth/require-admin";
import { logoutAction } from "@/lib/actions/admin/logout";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard, CalendarDays, Layers, Building2,
  InboxIcon, MessageSquare, Settings, LogOut,
} from "lucide-react";

const NAV = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Événements",      href: "/admin/evenements", icon: CalendarDays },
  { label: "Activités",       href: "/admin/activites",  icon: Layers },
  { label: "Hébergements",    href: "/admin/hebergements", icon: Building2 },
  { label: "Demandes",        href: "/admin/demandes",   icon: InboxIcon },
  { label: "Messages",        href: "/admin/messages",   icon: MessageSquare },
  { label: "Paramètres",      href: "/admin/settings",   icon: Settings },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-[var(--color-surface-container-low)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[var(--color-primary)] flex flex-col">
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 px-3 py-1 rounded-lg bg-white/10 border border-white/20 flex items-center">
              <span className="font-extrabold text-sm text-white tracking-tight">ATHLORA</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-secondary)]">Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href as "/"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white truncate">{session.email}</p>
              <p className="text-[10px] text-white/40">Admin</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Se déconnecter"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/30 transition-colors text-white/70 hover:text-red-300"
              >
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
