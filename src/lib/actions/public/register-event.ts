"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { demandesReservations } from "@/db/schema";
import { registerEventSchema } from "@/lib/validation/forms";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DemandeReservationInsert } from "@/db/schema";

export type FormState = { success: true; message: string } | { success: false; error: string } | null;

export async function registerEventAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = registerEventSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: "serverError" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const allowed = await checkRateLimit(`register_event_${ip}`);
  if (!allowed) return { success: false, error: "tooManyRequests" };

  const { _hp, ...data } = parsed.data;
  void _hp;

  const insert: DemandeReservationInsert = {
    typeCible:   "evenement",
    cibleId:     data.cibleId,
    cibleTitre:  data.cibleTitre,
    nomClient:   data.nomClient,
    telephone:   data.telephone,
    email:       data.email || undefined,
    nbPersonnes: data.nbPersonnes,
    remarques:   data.remarques,
    locale:      data.locale,
    statut:      "en_attente",
  };

  await db.insert(demandesReservations).values(insert);
  return { success: true, message: "success" };
}
