import { db } from "@/db";
import { hebergements, hebergementsEvenements, hebergementsActivites } from "@/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";

export type StayFilters = {
  zone?: string;
  type?: string;
};

export async function getHebergementsPublies(filters: StayFilters = {}, page = 1, perPage = 9) {
  const conditions = [eq(hebergements.publie, true)];

  if (filters.zone) conditions.push(eq(hebergements.zone, filters.zone));
  if (filters.type) {
    conditions.push(
      eq(hebergements.type, filters.type as typeof hebergements.type._.data)
    );
  }

  const where = and(...conditions);
  const offset = (page - 1) * perPage;

  const [rows, [{ count }]] = await Promise.all([
    db.select().from(hebergements).where(where).orderBy(asc(hebergements.nomFr)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(hebergements).where(where),
  ]);

  return { items: rows, total: count, page, perPage, totalPages: Math.ceil(count / perPage) };
}

export async function getHebergementBySlug(slug: string) {
  const [row] = await db.select().from(hebergements).where(
    and(eq(hebergements.slug, slug), eq(hebergements.publie, true))
  );
  return row ?? null;
}

export async function getHebergementsAccueil(limit = 3) {
  return db.select().from(hebergements).where(eq(hebergements.publie, true))
    .orderBy(asc(hebergements.nomFr)).limit(limit);
}

export async function getHebergementsPourEvenement(evenementId: number) {
  return db
    .select({ hebergement: hebergements })
    .from(hebergementsEvenements)
    .innerJoin(hebergements, eq(hebergements.id, hebergementsEvenements.hebergementId))
    .where(
      and(eq(hebergementsEvenements.evenementId, evenementId), eq(hebergements.publie, true))
    );
}

export async function getHebergementsPourActivite(activiteId: number) {
  return db
    .select({ hebergement: hebergements })
    .from(hebergementsActivites)
    .innerJoin(hebergements, eq(hebergements.id, hebergementsActivites.hebergementId))
    .where(
      and(eq(hebergementsActivites.activiteId, activiteId), eq(hebergements.publie, true))
    );
}
