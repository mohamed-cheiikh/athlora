import { db } from "@/db";
import { messagesContact } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getMessagesAdmin(lu?: boolean, page = 1, perPage = 20) {
  const where = lu !== undefined ? eq(messagesContact.lu, lu) : undefined;

  const offset = (page - 1) * perPage;
  const [rows, [{ count }]] = await Promise.all([
    db.select().from(messagesContact).where(where).orderBy(desc(messagesContact.createdAt)).limit(perPage).offset(offset),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(messagesContact).where(where),
  ]);

  return { items: rows, total: count };
}

export async function markMessageLu(id: number) {
  const [row] = await db
    .update(messagesContact)
    .set({ lu: true })
    .where(eq(messagesContact.id, id))
    .returning();
  return row ?? null;
}

export async function markAllMessagesLu() {
  await db.update(messagesContact).set({ lu: true }).where(eq(messagesContact.lu, false));
}
