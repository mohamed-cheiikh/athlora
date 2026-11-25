import { requireAdmin } from "@/lib/auth/require-admin";
import { getActiviteAdminById } from "@/lib/queries/admin/activites";
import { ActiviteForm } from "@/components/admin/ActiviteForm";
import { updateActiviteAction } from "@/lib/actions/admin/activites";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditActivitePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const activite = await getActiviteAdminById(Number(id));
  if (!activite) notFound();

  const boundAction = updateActiviteAction.bind(null, activite.id);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={"/admin/activites" as "/"} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6">
        <ChevronLeft size={16} /> Activités
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">
        Modifier : {activite.titreFr}
      </h1>
      <ActiviteForm activite={activite} action={boundAction} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
