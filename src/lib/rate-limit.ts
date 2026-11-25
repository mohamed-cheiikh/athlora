import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const WINDOW_MS  = 10 * 60 * 1000;
const MAX_HITS   = 3;

export async function checkRateLimit(key: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  const [row] = await db.select().from(rateLimits).where(eq(rateLimits.cle, key));

  if (!row || new Date(row.fenetreDebut) < windowStart) {
    await db
      .insert(rateLimits)
      .values({ cle: key, compteur: 1, fenetreDebut: now })
      .onConflictDoUpdate({
        target: rateLimits.cle,
        set: { compteur: 1, fenetreDebut: now },
      });
    return true;
  }

  if (row.compteur >= MAX_HITS) return false;

  await db
    .update(rateLimits)
    .set({ compteur: sql`${rateLimits.compteur} + 1` })
    .where(eq(rateLimits.cle, key));

  return true;
}
