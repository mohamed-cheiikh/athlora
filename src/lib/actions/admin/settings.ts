"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { upsertParametre } from "@/lib/queries/parametres";

export async function updateAccueilAction(_: unknown, formData: FormData) {
  await requireAdmin();
  await upsertParametre("accueil", {
    heroTitreFr:     formData.get("heroTitreFr")?.toString().trim() ?? "",
    heroTitreAr:     formData.get("heroTitreAr")?.toString().trim() ?? "",
    heroSousTitreFr: formData.get("heroSousTitreFr")?.toString().trim() ?? "",
    heroSousTitreAr: formData.get("heroSousTitreAr")?.toString().trim() ?? "",
    presentationFr:  formData.get("presentationFr")?.toString().trim() ?? "",
    presentationAr:  formData.get("presentationAr")?.toString().trim() ?? "",
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateContactAction(_: unknown, formData: FormData) {
  await requireAdmin();
  await upsertParametre("contact", {
    email:     formData.get("email")?.toString().trim() ?? "",
    telephone: formData.get("telephone")?.toString().trim() ?? "",
    whatsapp:  formData.get("whatsapp")?.toString().trim() ?? "",
    adresseFr: formData.get("adresseFr")?.toString().trim() ?? "",
    adresseAr: formData.get("adresseAr")?.toString().trim() ?? "",
    latitude:  formData.get("latitude")?.toString() ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude")?.toString() ? Number(formData.get("longitude")) : null,
  });
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
}

export async function updateReseauxAction(_: unknown, formData: FormData) {
  await requireAdmin();
  await upsertParametre("reseaux", {
    facebook:  formData.get("facebook")?.toString().trim() ?? "",
    instagram: formData.get("instagram")?.toString().trim() ?? "",
    tiktok:    formData.get("tiktok")?.toString().trim() ?? "",
    youtube:   formData.get("youtube")?.toString().trim() ?? "",
  });
  revalidatePath("/admin/settings");
}
