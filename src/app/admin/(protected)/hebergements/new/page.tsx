import { requireAdmin } from "@/lib/auth/require-admin";
import { HebergementForm } from "@/components/admin/HebergementForm";
import { createHebergementAction } from "@/lib/actions/admin/hebergements";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function NewHebergementPage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={"/admin/hebergements" as "/"} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6">
        <ChevronLeft size={16} /> Hébergements
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">Nouvel hébergement</h1>
      <HebergementForm action={createHebergementAction} submitLabel="Créer l'hébergement" />
    </div>
  );
}
