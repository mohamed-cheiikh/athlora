import { db } from "@/db";
import { evenements, activites, hebergements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const ZONES_V1 = ["Alger", "Oran", "Mostaganem"] as const;
export type Zone = (typeof ZONES_V1)[number];

export async function getZonesEvenements() {
  const rows = await db
    .selectDistinct({ zone: evenements.zone })
    .from(evenements)
    .where(eq(evenements.publie, true))
    .orderBy(evenements.zone);
  return rows.map((r) => r.zone);
}

export async function getZonesActivites() {
  const rows = await db
    .selectDistinct({ zone: activites.zone })
    .from(activites)
    .where(eq(activites.publie, true))
    .orderBy(activites.zone);
  return rows.map((r) => r.zone);
}

export async function getZonesHebergements() {
  const rows = await db
    .selectDistinct({ zone: hebergements.zone })
    .from(hebergements)
    .where(eq(hebergements.publie, true))
    .orderBy(hebergements.zone);
  return rows.map((r) => r.zone);
}
