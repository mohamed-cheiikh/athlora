import { db } from "@/db";
import { evenements } from "@/db/schema";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

export type EventFilters = {
  zone?: string;
  sportType?: string;
  period?: "upcoming" | "past" | "all";
};

export async function getEvenementsPublies(filters: EventFilters = {}, page = 1, perPage = 9) {
  const now = new Date();
  const conditions = [eq(evenements.publie, true)];

  if (filters.zone) conditions.push(eq(evenements.zone, filters.zone));
  if (filters.sportType) {
    conditions.push(
      eq(evenements.sportType, filters.sportType as typeof evenements.sportType._.data)
    );
  }
  if (filters.period === "upcoming") conditions.push(gte(evenements.dateDebut, now));
  if (filters.period === "past") conditions.push(lt(evenements.dateDebut, now));

  const where = and(...conditions);
  const offset = (page - 1) * perPage;

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(evenements).where(where).orderBy(desc(evenements.dateDebut)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(evenements).where(where),
  ]);

  return { items: rows, total: count, page, perPage, totalPages: Math.ceil(count / perPage) };
}

export async function getEvenementBySlug(slug: string) {
  const [row] = await db.select().from(evenements).where(
    and(eq(evenements.slug, slug), eq(evenements.publie, true))
  );
  return row ?? null;
}

export async function getEvenementsALaUne(limit = 3) {
  return db.select().from(evenements).where(
    and(eq(evenements.publie, true), eq(evenements.aLaUne, true))
  ).orderBy(desc(evenements.dateDebut)).limit(limit);
}
