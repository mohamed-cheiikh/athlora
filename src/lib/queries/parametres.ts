import { db } from "@/db";
import { parametresSite } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getParametre<T = unknown>(cle: string): Promise<T | null> {
  const [row] = await db.select().from(parametresSite).where(eq(parametresSite.cle, cle));
  return row ? (row.valeur as T) : null;
}

export async function getAllParametres() {
  const rows = await db.select().from(parametresSite);
  return Object.fromEntries(rows.map((r) => [r.cle, r.valeur]));
}

export async function upsertParametre(cle: string, valeur: unknown) {
  await db
    .insert(parametresSite)
    .values({ cle, valeur })
    .onConflictDoUpdate({ target: parametresSite.cle, set: { valeur } });
}
