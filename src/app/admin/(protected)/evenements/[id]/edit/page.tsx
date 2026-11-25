import { requireAdmin } from "@/lib/auth/require-admin";
import { getEvenementAdminById } from "@/lib/queries/admin/evenements";
import { EvenementForm } from "@/components/admin/EvenementForm";
import { updateEvenementAction } from "@/lib/actions/admin/evenements";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditEvenementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await getEvenementAdminById(Number(id));
  if (!event) notFound();

  const boundAction = updateEvenementAction.bind(null, event.id);

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={"/admin/evenements" as "/"} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] mb-6">
        <ChevronLeft size={16} /> Événements
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] mb-8">Modifier : {event.titreFr}</h1>
      <EvenementForm event={event} action={boundAction} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
