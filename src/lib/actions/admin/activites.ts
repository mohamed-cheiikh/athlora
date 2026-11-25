"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createActivite, updateActivite, deleteActivite, togglePublishActivite,
} from "@/lib/queries/admin/activites";
import { uploadImageAction } from "./upload-image";
import type { ActiviteInsert } from "@/db/schema";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);
}

function formToInsert(fd: FormData, imageUrl?: string | null): ActiviteInsert {
  return {
    slug:                     fd.get("slug")?.toString().trim() || slugify(fd.get("titreFr")?.toString() ?? "activite") + "-" + Date.now(),
    categoriePrincipale:      fd.get("categoriePrincipale") as ActiviteInsert["categoriePrincipale"] ?? "sport",
    sousCategorie:            fd.get("sousCategorie")?.toString().trim() ?? "autre",
    titreFr:                  fd.get("titreFr")?.toString().trim() ?? "",
    titreAr:                  fd.get("titreAr")?.toString().trim() || null,
    descriptionFr:            fd.get("descriptionFr")?.toString().trim() ?? "",
    descriptionAr:            fd.get("descriptionAr")?.toString().trim() || null,
    dureeFr:                  fd.get("dureeFr")?.toString().trim() || null,
    dureeAr:                  fd.get("dureeAr")?.toString().trim() || null,
    equipementFr:             fd.get("equipementFr")?.toString().trim() || null,
    equipementAr:             fd.get("equipementAr")?.toString().trim() || null,
    prix:                     fd.get("prix")?.toString() ? Number(fd.get("prix")) : null,
    contactOrganisateurNom:   fd.get("contactOrganisateurNom")?.toString().trim() || null,
    contactOrganisateurTel:   fd.get("contactOrganisateurTel")?.toString().trim() || null,
    contactOrganisateurEmail: fd.get("contactOrganisateurEmail")?.toString().trim() || null,
    publie:                   fd.get("publie") === "on",
    zone:                     fd.get("zone")?.toString().trim() ?? "",
    lieuFr:                   fd.get("lieuFr")?.toString().trim() ?? "",
    lieuAr:                   fd.get("lieuAr")?.toString().trim() || null,
    latitude:                 fd.get("latitude")?.toString() ? Number(fd.get("latitude")) : null,
    longitude:                fd.get("longitude")?.toString() ? Number(fd.get("longitude")) : null,
    mapsUrl:                  fd.get("mapsUrl")?.toString().trim() || null,
    image:                    imageUrl ?? (fd.get("imageExistante")?.toString() || null),
    galerie:                  [],
  };
}

export async function createActiviteAction(_: unknown, formData: FormData) {
  await requireAdmin();
  let imageUrl: string | null = null;
  const f = formData.get("image") as File | null;
  if (f && f.size > 0) { const fd = new FormData(); fd.append("image", f); imageUrl = await uploadImageAction(fd); }
  await createActivite(formToInsert(formData, imageUrl));
  revalidatePath("/admin/activites");
  redirect("/admin/activites");
}

export async function updateActiviteAction(id: number, _: unknown, formData: FormData) {
  await requireAdmin();
  let imageUrl: string | undefined = undefined;
  const f = formData.get("image") as File | null;
  if (f && f.size > 0) { const fd = new FormData(); fd.append("image", f); imageUrl = (await uploadImageAction(fd)) ?? undefined; }
  await updateActivite(id, formToInsert(formData, imageUrl));
  revalidatePath("/admin/activites");
  redirect("/admin/activites");
}

export async function deleteActiviteAction(id: number) {
  await requireAdmin();
  await deleteActivite(id);
  revalidatePath("/admin/activites");
}

export async function togglePublishActiviteAction(id: number, publie: boolean) {
  await requireAdmin();
  await togglePublishActivite(id, publie);
  revalidatePath("/admin/activites");
}
