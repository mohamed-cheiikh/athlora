import { db } from "@/db";
import { activites, type ActiviteInsert } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export async function getActivitesAdmin(search = "", page = 1, perPage = 20) {
  const where = search
    ? or(ilike(activites.titreFr, `%${search}%`), ilike(activites.zone, `%${search}%`))
    : undefined;

  const offset = (page - 1) * perPage;
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(activites).where(where).orderBy(desc(activites.createdAt)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(activites).where(where),
  ]);

  return { items: rows, total: count };
}

export async function getActiviteAdminById(id: number) {
  const [row] = await db.select().from(activites).where(eq(activites.id, id));
  return row ?? null;
}

export async function createActivite(data: ActiviteInsert) {
  const [row] = await db.insert(activites).values(data).returning();
  return row;
}

export async function updateActivite(id: number, data: Partial<ActiviteInsert>) {
  const [row] = await db.update(activites).set(data).where(eq(activites.id, id)).returning();
  return row ?? null;
}

export async function deleteActivite(id: number) {
  await db.delete(activites).where(eq(activites.id, id));
}

export async function togglePublishActivite(id: number, publie: boolean) {
  return updateActivite(id, { publie });
}
