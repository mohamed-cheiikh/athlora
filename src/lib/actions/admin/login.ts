"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { usersAdmin } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";

export type LoginState = { error: string } | null;

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const mdp   = formData.get("mdp")?.toString() ?? "";

  if (!email || !mdp) return { error: "invalidCredentials" };

  const [user] = await db.select().from(usersAdmin).where(eq(usersAdmin.email, email));
  if (!user) return { error: "invalidCredentials" };

  const ok = await verifyPassword(mdp, user.motDePasseHash);
  if (!ok) return { error: "invalidCredentials" };

  const token = await createSessionToken({ sub: String(user.id), email: user.email });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  await db.update(usersAdmin).set({ derniereConnexion: new Date() }).where(eq(usersAdmin.id, user.id));

  redirect("/admin");
}
