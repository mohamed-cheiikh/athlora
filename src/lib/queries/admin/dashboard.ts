import { db } from "@/db";
import { evenements, activites, hebergements, demandesReservations, messagesContact } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getDashboardStats() {
  const [[events], [acts], [stays], [pending], [unread]] = await Promise.all([
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(evenements),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(activites),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(hebergements),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(demandesReservations).where(eq(demandesReservations.statut, "en_attente")),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(messagesContact).where(eq(messagesContact.lu, false)),
  ]);

  return {
    totalEvents: events.count,
    totalActivities: acts.count,
    totalStays: stays.count,
    pendingRequests: pending.count,
    unreadMessages: unread.count,
  };
}

export async function getRecentRequests(limit = 10) {
  return db.select().from(demandesReservations).orderBy(desc(demandesReservations.createdAt)).limit(limit);
}
