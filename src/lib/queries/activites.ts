import { db } from "@/db";
import { activites } from "@/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";

export type ActivityFilters = {
  zone?: string;
  categorie?: "sport" | "tourisme";
  sousCategorie?: string;
};

export async function getActivitesPubliees(filters: ActivityFilters = {}, page = 1, perPage = 9) {
  const conditions = [eq(activites.publie, true)];

  if (filters.zone) conditions.push(eq(activites.zone, filters.zone));
  if (filters.categorie) {
    conditions.push(
      eq(activites.categoriePrincipale, filters.categorie as typeof activites.categoriePrincipale._.data)
    );
  }
  if (filters.sousCategorie) conditions.push(eq(activites.sousCategorie, filters.sousCategorie));

  const where = and(...conditions);
  const offset = (page - 1) * perPage;

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(activites).where(where).orderBy(asc(activites.titreFr)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(activites).where(where),
  ]);

  return { items: rows, total: count, page, perPage, totalPages: Math.ceil(count / perPage) };
}

export async function getActiviteBySlug(slug: string) {
  const [row] = await db.select().from(activites).where(
    and(eq(activites.slug, slug), eq(activites.publie, true))
  );
  return row ?? null;
}

export async function getActivitesSport(limit = 4) {
  return db.select().from(activites).where(
    and(eq(activites.publie, true), eq(activites.categoriePrincipale, "sport"))
  ).orderBy(asc(activites.titreFr)).limit(limit);
}

export async function getActivitesTourisme(limit = 4) {
  return db.select().from(activites).where(
    and(eq(activites.publie, true), eq(activites.categoriePrincipale, "tourisme"))
  ).orderBy(asc(activites.titreFr)).limit(limit);
}
