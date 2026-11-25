import { db } from "@/db";
import { hebergements, type HebergementInsert } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export async function getHebergementsAdmin(search = "", page = 1, perPage = 20) {
  const where = search
    ? or(ilike(hebergements.nomFr, `%${search}%`), ilike(hebergements.zone, `%${search}%`))
    : undefined;

  const offset = (page - 1) * perPage;
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(hebergements).where(where).orderBy(desc(hebergements.createdAt)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(hebergements).where(where),
  ]);

  return { items: rows, total: count };
}

export async function getHebergementAdminById(id: number) {
  const [row] = await db.select().from(hebergements).where(eq(hebergements.id, id));
  return row ?? null;
}

export async function createHebergement(data: HebergementInsert) {
  const [row] = await db.insert(hebergements).values(data).returning();
  return row;
}

export async function updateHebergement(id: number, data: Partial<HebergementInsert>) {
  const [row] = await db.update(hebergements).set(data).where(eq(hebergements.id, id)).returning();
  return row ?? null;
}

export async function deleteHebergement(id: number) {
  await db.delete(hebergements).where(eq(hebergements.id, id));
}

export async function togglePublishHebergement(id: number, publie: boolean) {
  return updateHebergement(id, { publie });
}
