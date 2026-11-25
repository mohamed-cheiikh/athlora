import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL manquant");

const sql = neon(url);
const db = drizzle({ client: sql, schema, casing: "snake_case" });

const nom = process.argv[2];
const email = process.argv[3];
const mdp = process.argv[4];

if (!nom || !email || !mdp) {
  console.error("Usage: npm run admin:create <nom> <email> <mot-de-passe>");
  process.exit(1);
}

const hash = await bcrypt.hash(mdp, 12);

await db.insert(schema.usersAdmin).values({ nom, email, motDePasseHash: hash });

console.log(`✅ Admin créé : ${email}`);
process.exit(0);
