"use server";

import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function uploadImageAction(formData: FormData): Promise<string | null> {
  await requireAdmin();

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `athlora/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, { access: "public" });
  return blob.url;
}
