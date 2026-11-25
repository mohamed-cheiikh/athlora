import { db } from "@/db";
import { demandesReservations } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getDemandesAdmin(statut?: string, page = 1, perPage = 20) {
  const where = statut
    ? eq(demandesReservations.statut, statut as typeof demandesReservations.statut._.data)
    : undefined;

  const offset = (page - 1) * perPage;
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(demandesReservations).where(where).orderBy(desc(demandesReservations.createdAt)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(demandesReservations).where(where),
  ]);

  return { items: rows, total: count };
}

export async function getDemandeById(id: number) {
  const [row] = await db.select().from(demandesReservations).where(eq(demandesReservations.id, id));
  return row ?? null;
}

export async function updateStatutDemande(
  id: number,
  statut: "en_attente" | "confirme" | "annule",
  noteAdmin?: string
) {
  const [row] = await db
    .update(demandesReservations)
    .set({ statut, ...(noteAdmin !== undefined && { noteAdmin }) })
    .where(eq(demandesReservations.id, id))
    .returning();
  return row ?? null;
}
