"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateStatutDemande } from "@/lib/queries/admin/demandes";

export async function updateStatutAction(id: number, statut: "en_attente" | "confirme" | "annule", noteAdmin?: string) {
  await requireAdmin();
  await updateStatutDemande(id, statut, noteAdmin);
  revalidatePath("/admin/demandes");
}
