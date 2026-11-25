"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createEvenement, updateEvenement, deleteEvenement, togglePublishEvenement,
} from "@/lib/queries/admin/evenements";
import { uploadImageAction } from "./upload-image";
import type { EvenementInsert } from "@/db/schema";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);
}

function formToInsert(fd: FormData, imageUrl?: string | null): EvenementInsert {
  return {
    slug:          fd.get("slug")?.toString().trim() || slugify(fd.get("titreFr")?.toString() ?? "event") + "-" + Date.now(),
    titreFr:       fd.get("titreFr")?.toString().trim() ?? "",
    titreAr:       fd.get("titreAr")?.toString().trim() || null,
    descriptionFr: fd.get("descriptionFr")?.toString().trim() ?? "",
    descriptionAr: fd.get("descriptionAr")?.toString().trim() || null,
    programmeFr:   fd.get("programmeFr")?.toString().trim() || null,
    programmeAr:   fd.get("programmeAr")?.toString().trim() || null,
    conditionsFr:  fd.get("conditionsFr")?.toString().trim() || null,
    conditionsAr:  fd.get("conditionsAr")?.toString().trim() || null,
    sportType:     fd.get("sportType") as EvenementInsert["sportType"] ?? "autre",
    niveau:        (fd.get("niveau")?.toString() || null) as EvenementInsert["niveau"],
    dateDebut:     new Date(fd.get("dateDebut")?.toString() ?? ""),
    dateFin:       fd.get("dateFin")?.toString() ? new Date(fd.get("dateFin")!.toString()) : null,
    prix:          fd.get("prix")?.toString() ? Number(fd.get("prix")) : null,
    placesMax:     fd.get("placesMax")?.toString() ? Number(fd.get("placesMax")) : null,
    aLaUne:        fd.get("aLaUne") === "on",
    publie:        fd.get("publie") === "on",
    zone:          fd.get("zone")?.toString().trim() ?? "",
    lieuFr:        fd.get("lieuFr")?.toString().trim() ?? "",
    lieuAr:        fd.get("lieuAr")?.toString().trim() || null,
    latitude:      fd.get("latitude")?.toString() ? Number(fd.get("latitude")) : null,
    longitude:     fd.get("longitude")?.toString() ? Number(fd.get("longitude")) : null,
    mapsUrl:       fd.get("mapsUrl")?.toString().trim() || null,
    image:         imageUrl ?? (fd.get("imageExistante")?.toString() || null),
    galerie:       [],
  };
}

export async function createEvenementAction(_: unknown, formData: FormData) {
  await requireAdmin();

  let imageUrl: string | null = null;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const imgFd = new FormData();
    imgFd.append("image", imageFile);
    imageUrl = await uploadImageAction(imgFd);
  }

  await createEvenement(formToInsert(formData, imageUrl));
  revalidatePath("/admin/evenements");
  redirect("/admin/evenements");
}

export async function updateEvenementAction(id: number, _: unknown, formData: FormData) {
  await requireAdmin();

  let imageUrl: string | undefined = undefined;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const imgFd = new FormData();
    imgFd.append("image", imageFile);
    imageUrl = (await uploadImageAction(imgFd)) ?? undefined;
  }

  const data = formToInsert(formData, imageUrl);
  await updateEvenement(id, data);
  revalidatePath("/admin/evenements");
  redirect("/admin/evenements");
}

export async function deleteEvenementAction(id: number) {
  await requireAdmin();
  await deleteEvenement(id);
  revalidatePath("/admin/evenements");
}

export async function togglePublishEvenementAction(id: number, publie: boolean) {
  await requireAdmin();
  await togglePublishEvenement(id, publie);
  revalidatePath("/admin/evenements");
}
