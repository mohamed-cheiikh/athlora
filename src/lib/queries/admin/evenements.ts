import { db } from "@/db";
import { evenements, type EvenementInsert } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export async function getEvenementsAdmin(search = "", page = 1, perPage = 20) {
  const where = search
    ? or(ilike(evenements.titreFr, `%${search}%`), ilike(evenements.zone, `%${search}%`))
    : undefined;

  const offset = (page - 1) * perPage;
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(evenements).where(where).orderBy(desc(evenements.createdAt)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(evenements).where(where),
  ]);

  return { items: rows, total: count };
}

export async function getEvenementAdminById(id: number) {
  const [row] = await db.select().from(evenements).where(eq(evenements.id, id));
  return row ?? null;
}

export async function createEvenement(data: EvenementInsert) {
  const [row] = await db.insert(evenements).values(data).returning();
  return row;
}

export async function updateEvenement(id: number, data: Partial<EvenementInsert>) {
  const [row] = await db.update(evenements).set(data).where(eq(evenements.id, id)).returning();
  return row ?? null;
}

export async function deleteEvenement(id: number) {
  await db.delete(evenements).where(eq(evenements.id, id));
}

export async function togglePublishEvenement(id: number, publie: boolean) {
  return updateEvenement(id, { publie });
}
