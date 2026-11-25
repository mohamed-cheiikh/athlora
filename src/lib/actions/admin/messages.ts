"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { markMessageLu, markAllMessagesLu } from "@/lib/queries/admin/messages";

export async function markLuAction(id: number) {
  await requireAdmin();
  await markMessageLu(id);
  revalidatePath("/admin/messages");
}

export async function markAllLuAction() {
  await requireAdmin();
  await markAllMessagesLu();
  revalidatePath("/admin/messages");
}
