import { requireAdmin } from "@/lib/auth/require-admin";
import { getHebergementAdminById } from "@/lib/queries/admin/hebergements";
import { HebergementForm } from "@/components/admin/HebergementForm";
import { updateHebergementAction } from "@/lib/actions/admin/hebergements";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditHebergementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const hebergement = await getHebergementAdminById(Number(id));
  if (!hebergement) notFound();

  const boundAction = updateHebergementAction.bind(null, hebergement.id);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={"/admin/hebergements" as "/"} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6">
        <ChevronLeft size={16} /> Hébergements
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">
        Modifier : {hebergement.nomFr}
      </h1>
      <HebergementForm hebergement={hebergement} action={boundAction} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
