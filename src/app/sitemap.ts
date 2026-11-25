import type { MetadataRoute } from "next";
import { db } from "@/db";
import { evenements, activites, hebergements } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://athlora.com";
const LOCALES = ["fr", "ar"] as const;

function url(locale: string, path: string) {
  return locale === "fr" ? `${BASE}${path}` : `${BASE}/ar${path}`;
}

function staticEntry(path: string, priority = 0.8): MetadataRoute.Sitemap[number] {
  return {
    url: url("fr", path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, url(l, path)])),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [evs, acts, stays] = await Promise.all([
    db.select({ slug: evenements.slug, updatedAt: evenements.updatedAt })
      .from(evenements).where(eq(evenements.publie, true)),
    db.select({ slug: activites.slug, updatedAt: activites.updatedAt })
      .from(activites).where(eq(activites.publie, true)),
    db.select({ slug: hebergements.slug, updatedAt: hebergements.updatedAt })
      .from(hebergements).where(eq(hebergements.publie, true)),
  ]);

  const statics: MetadataRoute.Sitemap = [
    staticEntry("/", 1.0),
    staticEntry("/evenements", 0.9),
    staticEntry("/activites", 0.9),
    staticEntry("/hebergements", 0.9),
    staticEntry("/contact", 0.6),
  ];

  const eventEntries: MetadataRoute.Sitemap = evs.map((e) => ({
    url: url("fr", `/evenements/${e.slug}`),
    lastModified: e.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, url(l, `/evenements/${e.slug}`)])
      ),
    },
  }));

  const actEntries: MetadataRoute.Sitemap = acts.map((a) => ({
    url: url("fr", `/activites/${a.slug}`),
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, url(l, `/activites/${a.slug}`)])
      ),
    },
  }));

  const stayEntries: MetadataRoute.Sitemap = stays.map((s) => ({
    url: url("fr", `/hebergements/${s.slug}`),
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.75,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, url(l, `/hebergements/${s.slug}`)])
      ),
    },
  }));

  return [...statics, ...eventEntries, ...actEntries, ...stayEntries];
}
