import { requireAdmin } from "@/lib/auth/require-admin";
import { ActiviteForm } from "@/components/admin/ActiviteForm";
import { createActiviteAction } from "@/lib/actions/admin/activites";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewActivitePage() {
  await requireAdmin();

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={"/admin/activites"} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6">
        <ChevronLeft size={16} /> Activités
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">Nouvelle activité</h1>
      <ActiviteForm action={createActiviteAction} submitLabel="Créer l'activité" />
    </div>
  );
}
