"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createHebergement, updateHebergement, deleteHebergement, togglePublishHebergement,
} from "@/lib/queries/admin/hebergements";
import { uploadImageAction } from "./upload-image";
import type { HebergementInsert } from "@/db/schema";

const AMENITIES_KEYS = ["wifi", "parking", "piscine", "restaurant", "clim", "petit_dejeuner", "salle_sport", "spa"];

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 150);
}

function formToInsert(fd: FormData, imageUrl?: string | null): HebergementInsert {
  const commodites = AMENITIES_KEYS.filter((k) => fd.get(k) === "on");
  return {
    slug:          fd.get("slug")?.toString().trim() || slugify(fd.get("nomFr")?.toString() ?? "hebergement") + "-" + Date.now(),
    type:          fd.get("type") as HebergementInsert["type"] ?? "hotel",
    nomFr:         fd.get("nomFr")?.toString().trim() ?? "",
    nomAr:         fd.get("nomAr")?.toString().trim() || null,
    descriptionFr: fd.get("descriptionFr")?.toString().trim() ?? "",
    descriptionAr: fd.get("descriptionAr")?.toString().trim() || null,
    adresse:       fd.get("adresse")?.toString().trim() ?? "",
    telephone:     fd.get("telephone")?.toString().trim() || null,
    email:         fd.get("email")?.toString().trim() || null,
    siteWeb:       fd.get("siteWeb")?.toString().trim() || null,
    tarifIndicatif: fd.get("tarifIndicatif")?.toString() ? Number(fd.get("tarifIndicatif")) : null,
    commodites,
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

export async function createHebergementAction(_: unknown, formData: FormData) {
  await requireAdmin();
  let imageUrl: string | null = null;
  const f = formData.get("image") as File | null;
  if (f && f.size > 0) { const fd = new FormData(); fd.append("image", f); imageUrl = await uploadImageAction(fd); }
  await createHebergement(formToInsert(formData, imageUrl));
  revalidatePath("/admin/hebergements");
  redirect("/admin/hebergements");
}

export async function updateHebergementAction(id: number, _: unknown, formData: FormData) {
  await requireAdmin();
  let imageUrl: string | undefined = undefined;
  const f = formData.get("image") as File | null;
  if (f && f.size > 0) { const fd = new FormData(); fd.append("image", f); imageUrl = (await uploadImageAction(fd)) ?? undefined; }
  await updateHebergement(id, formToInsert(formData, imageUrl));
  revalidatePath("/admin/hebergements");
  redirect("/admin/hebergements");
}

export async function deleteHebergementAction(id: number) {
  await requireAdmin();
  await deleteHebergement(id);
  revalidatePath("/admin/hebergements");
}

export async function togglePublishHebergementAction(id: number, publie: boolean) {
  await requireAdmin();
  await togglePublishHebergement(id, publie);
  revalidatePath("/admin/hebergements");
}
