import { requireAdmin } from "@/lib/auth/require-admin";
import { getAllParametres } from "@/lib/queries/parametres";
import { SettingsAccueil, SettingsContact, SettingsReseaux } from "@/components/admin/SettingsForms";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const params = await getAllParametres() as Record<string, Record<string, unknown>>;

  const accueil = (params.accueil ?? {}) as Record<string, string>;
  const contact = (params.contact ?? {}) as Record<string, string | number | null>;
  const reseaux = (params.reseaux ?? {}) as Record<string, string>;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Paramètres du site</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">Textes et informations visibles sur le site public</p>
      </div>

      <div className="flex flex-col gap-8">
        <SettingsAccueil accueil={accueil} />
        <SettingsContact contact={contact} />
        <SettingsReseaux reseaux={reseaux} />
      </div>
    </div>
  );
}
