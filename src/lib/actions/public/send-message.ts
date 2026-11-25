"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { messagesContact } from "@/db/schema";
import { contactSchema } from "@/lib/validation/forms";
import { checkRateLimit } from "@/lib/rate-limit";
import type { MessageContactInsert } from "@/db/schema";
import type { FormState } from "./register-event";

export type { FormState };

export async function sendMessageAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(rawData);

  if (!parsed.success) return { success: false, error: "serverError" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const allowed = await checkRateLimit(`contact_${ip}`);
  if (!allowed) return { success: false, error: "tooManyRequests" };

  const { _hp, ...data } = parsed.data;
  void _hp;

  const insert: MessageContactInsert = {
    nom:       data.nom,
    email:     data.email,
    telephone: data.telephone || undefined,
    sujet:     data.sujet,
    message:   data.message,
    lu:        false,
    locale:    data.locale,
  };

  await db.insert(messagesContact).values(insert);
  return { success: true, message: "successContact" };
}
