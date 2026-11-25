import { requireAdmin } from "@/lib/auth/require-admin";
import { EvenementForm } from "@/components/admin/EvenementForm";
import { createEvenementAction } from "@/lib/actions/admin/evenements";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

export default async function NewEvenementPage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={"/admin/evenements" as "/"} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6">
        <ChevronLeft size={16} /> Événements
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">Nouvel événement</h1>
      <EvenementForm action={createEvenementAction} submitLabel="Créer l'événement" />
    </div>
  );
}
