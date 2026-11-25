# Athlora — Plan de build détaillé avec Claude Code

**Stack :** Next.js 16 (front + back) · Neon Postgres · Drizzle ORM · next-intl (FR/AR) · Maquettes Google Stitch
**Version du plan :** 1.0 — 25 novembre 2026
**Livraison :** samedi 5 décembre 2026
**Prestataire technique :** Mohamed Tahar Cheikh

> À placer dans le repo sous `docs/PLAN.md`. Claude Code le lit section par section (voir §6). Le `CLAUDE.md` (§6.2) reste court et renvoie ici.

---

## Sommaire

0. [Lecture rapide](#0-lecture-rapide)
1. [Stack technique & décisions](#1-stack-technique--décisions)
2. [Architecture applicative](#2-architecture-applicative)
3. [Base de données Neon](#3-base-de-données-neon)
4. [Bilingue FR/AR & RTL](#4-bilingue-frar--rtl)
5. [Intégrer les maquettes Stitch](#5-intégrer-les-maquettes-stitch)
6. [Configurer Claude Code](#6-configurer-claude-code)
7. [Plan d'exécution jour par jour (avec prompts)](#7-plan-dexécution-jour-par-jour)
8. [Sécurité](#8-sécurité)
9. [SEO, performance, accessibilité](#9-seo-performance-accessibilité)
10. [QA & recette](#10-qa--recette)
11. [Déploiement production](#11-déploiement-production)
12. [Risques & plan B](#12-risques--plan-b)
13. [Livraison & passation](#13-livraison--passation)
14. [Décisions à trancher](#14-décisions-à-trancher)
15. [Sources](#15-sources)

---

## 0. Lecture rapide

- **Il reste 10 jours calendaires** (mer. 25/11 → sam. 5/12). C'est faisable avec Claude Code **à condition** de : (1) partir des écrans Stitch existants, (2) déployer dès le J1, (3) récupérer le contenu réel du client (textes FR/AR, photos) **au plus tard le J5**.
- **Un seul projet Next.js 16** fait tout : pages publiques en Server Components, formulaires et back-office en Server Actions, pas d'API séparée. Base Neon accessible via Drizzle.
- **Méthode :** un jour = une phase. Chaque phase a des prompts prêts à copier dans Claude Code (§7), toujours en *mode plan* d'abord, puis exécution, vérification (`lint` + `typecheck` + `build`) et commit.
- **4 points de vigilance identifiés dans le plan initial :**
  1. Le schéma à 6 tables **ne permet pas** certaines fonctionnalités promises (Paramètres du site, publier/masquer, galerie, association hébergements ↔ événements, dates arrivée/départ). → On garde les 6 tables métier et on ajoute 4 tables de support (§3.1).
  2. **Next.js 16** a changé des conventions que les tutos (et parfois l'IA) ignorent : `proxy.ts` remplace `middleware.ts`, `params` et `cookies()` sont asynchrones. → Règles explicites dans `CLAUDE.md`.
  3. **Hébergement :** le plan gratuit Vercel (Hobby) est réservé à l'usage personnel non commercial. Pour un projet client → plan Pro ou autre hébergeur (§11.3).
  4. **Le contenu arabe** est souvent le goulot d'étranglement. Prévoir un fallback FR propre (§4.4) et lancer la collecte de contenu dès aujourd'hui.

---

## 1. Stack technique & décisions

| Couche | Choix | Pourquoi | Alternative |
| :--- | :--- | :--- | :--- |
| Framework | **Next.js 16** (dernière 16.x patchée), App Router, TypeScript strict, Turbopack | Front + back dans un seul projet ; Server Components + Server Actions | — |
| Styles | **Tailwind CSS v4** | Stitch exporte en HTML + Tailwind → conversion quasi directe | — |
| UI admin | **shadcn/ui** (Table, Dialog, Tabs, Badge, Sonner…) | Rapide, accessible, compatible Tailwind v4 | Écrans Stitch admin si tu en as |
| Icônes | **lucide-react** | Stitch charge souvent Material Symbols par CDN → à remplacer | Material Symbols auto-hébergé |
| Base de données | **Neon Postgres**, région AWS Frankfurt | Serverless, branches `dev`/`main`, plan gratuit suffisant pour la V1 | — |
| ORM | **Drizzle ORM** + `drizzle-kit` + `@neondatabase/serverless` (driver HTTP) | Léger, typé, requêtes paramétrées (anti-injection SQL), idéal en serverless | Prisma |
| Validation | **Zod** (schémas partagés client/serveur) | Une seule source de vérité pour les formulaires | — |
| i18n | **next-intl v4** | Compatible Server Components et `proxy.ts` de Next 16 | — |
| Auth admin | **Maison : `bcryptjs` + `jose`** (JWT dans un cookie httpOnly) | Colle exactement à la table `users_admin`, ~150 lignes, aucun service externe | Better Auth (ajoute ses propres tables) |
| Images | **Vercel Blob** (upload direct navigateur → Blob) | URL publiques, compatible `next/image`, contourne la limite de taille des fonctions | Neon Object Storage (tout chez Neon), Cloudinary |
| Cartes | **Google Maps Embed API** (iframe) + lien « Itinéraire » | Gratuit sans limite (clé API requise) | — |
| Formulaires | Server Actions + `useActionState` + Zod + honeypot + rate-limit en base | Zéro API à maintenir | — |
| Notifications (bonus) | Lien WhatsApp `wa.me` dans l'admin ; e-mail via **Resend** si le temps le permet | Contact rapide avec les clients | — |
| Hébergement | **Vercel**, fonctions en région `fra1` (même région que Neon) | Déploiement Git natif, previews par branche | Netlify, VPS + Coolify |
| Tests | Playwright (5 parcours « smoke ») + recette manuelle | Filet de sécurité avant livraison | Manuel uniquement |

**Pourquoi l'auth maison plutôt qu'une librairie ?** Un seul rôle (admin), pas d'inscription publique, pas d'OAuth. Une librairie complète apporterait 3 à 4 tables et des concepts inutiles ici. Le code maison reste petit et auditable, à condition de respecter la checklist §8.2. Si tu préfères une librairie, Better Auth (racheté par Vercel en 2026) est le meilleur candidat (adaptateur Drizzle natif).

---

## 2. Architecture applicative

### 2.1 Vue d'ensemble

```
Navigateur (FR / LTR · AR / RTL)
        │
        ▼
  src/proxy.ts ── next-intl (détection & préfixe de langue)
        │        └─ /admin/* : redirection optimiste si pas de cookie de session valide
        │
        ├── app/[locale]/…  (site public, Server Components)
        │      ├─ lecture : lib/queries/*  → Drizzle → Neon
        │      └─ formulaires : lib/actions/public/* (Zod, honeypot, rate-limit)
        │                         → demandes_reservations / messages_contact
        │
        └── app/admin/…  (back-office)
               ├─ requireAdmin() dans le layout ET dans chaque Server Action
               ├─ CRUD : lib/actions/admin/* → Neon
               ├─ upload : /api/upload (Vercel Blob, upload client) → URL stockée en base
               └─ après chaque mutation : revalidatePath('/', 'layout')
```

### 2.2 Arborescence cible

```
athlora/
├─ CLAUDE.md                       ← instructions permanentes pour Claude Code (§6.2)
├─ .claude/
│  ├─ settings.json                ← permissions (§6.3)
│  ├─ skills/                      ← stitch-convert, admin-crud, i18n-rtl-audit (§6.4)
│  └─ agents/                      ← security-reviewer, rtl-reviewer (§6.5)
├─ .mcp.json                       ← serveurs MCP partagés (sans secrets)
├─ docs/
│  ├─ PLAN.md                      ← ce document
│  ├─ COMPONENTS.md                ← inventaire des composants (généré en Phase 1)
│  ├─ PROGRESS.md                  ← journal d'avancement (mis à jour chaque soir)
│  └─ GUIDE_ADMIN.md               ← livrable client (J10)
├─ design/stitch/                  ← exports Stitch (HTML + captures), versionnés
│  ├─ DESIGN.md                    ← tokens exportés par Stitch (si disponible)
│  ├─ 01-accueil/ code.html, screen-desktop.png, screen-mobile.png
│  ├─ 02-evenements-catalogue/ …
│  └─ …
├─ drizzle/                        ← migrations SQL générées (versionnées)
├─ messages/ fr.json, ar.json
├─ public/ logo, favicon, og-default.jpg
├─ scripts/ seed.ts, create-admin.ts, import-contenu.ts (optionnel)
├─ src/
│  ├─ proxy.ts
│  ├─ i18n/ routing.ts, navigation.ts, request.ts
│  ├─ app/
│  │  ├─ layout.tsx                ← passe-plat (retourne children), requis par next-intl
│  │  ├─ not-found.tsx
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx             ← <html lang dir>, polices, Header, Footer
│  │  │  ├─ page.tsx               ← Accueil
│  │  │  ├─ evenements/ page.tsx, [slug]/page.tsx
│  │  │  ├─ activites/ page.tsx, [slug]/page.tsx
│  │  │  ├─ hebergements/ page.tsx, [slug]/page.tsx
│  │  │  ├─ contact/page.tsx
│  │  │  └─ not-found.tsx
│  │  ├─ admin/
│  │  │  ├─ layout.tsx             ← <html lang="fr" dir="ltr">, police admin
│  │  │  ├─ login/page.tsx
│  │  │  └─ (protected)/
│  │  │     ├─ layout.tsx          ← requireAdmin() + sidebar
│  │  │     ├─ page.tsx            ← Dashboard
│  │  │     ├─ evenements/ page.tsx, nouveau/page.tsx, [id]/page.tsx
│  │  │     ├─ activites/ …
│  │  │     ├─ hebergements/ …
│  │  │     ├─ demandes/page.tsx   ← 3 onglets
│  │  │     └─ parametres/page.tsx
│  │  ├─ api/upload/route.ts
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ ui/                       ← shadcn
│  │  ├─ layout/ Header, Footer, LanguageSwitcher, MobileNav
│  │  ├─ sections/ Hero, FeaturedEvents, ActivitiesTeaser, StaysTeaser, Values
│  │  ├─ cards/ EventCard, ActivityCard, StayCard
│  │  ├─ shared/ MapEmbed, Gallery, FilterBar, CategoryTabs, Pagination, EmptyState, NearbySuggestions, PriceTag, DateBadge
│  │  ├─ forms/ EventRegistrationForm, BookingForm, ContactForm, FormField
│  │  └─ admin/ Sidebar, DataTable, BilingualFields, ImageUploader, StatusBadge, StatCard, ConfirmDialog
│  ├─ db/ index.ts, schema.ts
│  ├─ lib/
│  │  ├─ auth/ password.ts, session.ts, require-admin.ts
│  │  ├─ queries/ evenements.ts, activites.ts, hebergements.ts, demandes.ts, parametres.ts, dashboard.ts
│  │  ├─ actions/public/ demandes.ts, contact.ts
│  │  ├─ actions/admin/ evenements.ts, activites.ts, hebergements.ts, demandes.ts, parametres.ts, auth.ts
│  │  ├─ validation/ (schémas Zod)
│  │  ├─ content.ts                ← pick(locale, fr, ar) + fallback
│  │  ├─ rate-limit.ts, maps.ts, slug.ts, format.ts, phone.ts
│  └─ styles/globals.css           ← Tailwind v4 + @theme (tokens Stitch)
├─ .env.example
├─ drizzle.config.ts
└─ next.config.ts
```

### 2.3 Stratégie de rendu & cache

| Zone | Rendu | Détail |
| :--- | :--- | :--- |
| Accueil | Statique + ISR (`revalidate = 300`) | `setRequestLocale(locale)` obligatoire pour le rendu statique avec next-intl |
| Catalogues | Dynamique | Les filtres passent par `searchParams` (URL partageable) |
| Fiches détail | ISR à la demande | `generateStaticParams` peut retourner `[]` ; `notFound()` si slug inconnu ou non publié |
| Admin | Dynamique | Lit les cookies |
| Après toute mutation admin | `revalidatePath('/', 'layout')` | Invalide tout le site public : simple et correct pour un site de cette taille |

- On **n'active pas** `cacheComponents` (Cache Components de Next 16) en V1 : moins de concepts, moins de bugs.
- Le plan gratuit Neon met la base en veille après 5 min d'inactivité : la première requête qui suit est un peu plus lente. L'ISR du public masque l'essentiel de ce délai.

### 2.4 Conventions de code

- Server Components par défaut ; `"use client"` uniquement pour : formulaires, sélecteur de langue, barre de filtres, galerie (lightbox), menu mobile, uploader, tableaux admin interactifs.
- Lectures en base **uniquement** dans `lib/queries/*`, écritures **uniquement** dans `lib/actions/*`. Ces fichiers commencent par `import "server-only"`.
- Toute Server Action admin commence par `await requireAdmin()`.
- Aucun texte d'interface en dur : tout passe par `messages/fr.json` et `messages/ar.json`.
- Classes Tailwind **logiques** uniquement (`ms-`, `pe-`, `start-`, `text-start`…), jamais `ml-`, `pr-`, `left-`, `text-left`.
- Base en `snake_case` français, TypeScript en `camelCase` (mapping automatique via `casing: "snake_case"`).
- Prix en **entier DZD** (`null` = gratuit). Dates en `timestamptz`. Affichage via `Intl` (`fr-DZ` / `ar-DZ`, qui utilise les chiffres latins comme l'usage local).
- Descriptions en **texte brut** (pas d'éditeur riche en V1) affichées avec `whitespace-pre-line` : zéro risque XSS, zéro dépendance.

---

## 3. Base de données Neon

### 3.1 Écarts par rapport au schéma initial (et pourquoi)

| Ajout | Table(s) | Raison |
| :--- | :--- | :--- |
| `slug` | évènements, activités, hébergements | URLs lisibles et SEO (`/evenements/trail-des-falaises`) |
| `publie` | idem | Le back-office doit pouvoir « publier/masquer » (prévu au §3.2 du plan initial mais absent du schéma) |
| `galerie` (jsonb) | idem | Les fiches détail affichent une galerie ; `image` seule ne suffit pas |
| `zone`, `lieu_fr/ar`, `latitude`, `longitude` | idem | Filtres « par lieu », suggestions « à proximité », carte précise |
| `date_fin`, `niveau`, `programme_*`, `conditions_*`, `a_la_une`, `places_max` | évènements | Contenus de la page détail + section « à la une » |
| `duree_*`, `equipement_*`, `prix`, contact organisateur détaillé | activités | Contenus de la page détail |
| `tarif_indicatif`, `commodites`, `email`, `site_web` | hébergements | Cartes et fiches |
| `date_fin`, `remarques`, `cible_titre`, `locale`, `note_admin`, `updated_at` | demandes | Arrivée/départ pour l'hébergement, remarques du formulaire évènement, historique lisible si la cible est supprimée, réponse dans la langue du client |
| `locale` | messages | Idem |
| **`parametres_site`** (nouvelle) | — | « Paramètres du site » (§3.6 du plan initial) impossible sans stockage |
| **`hebergements_evenements`**, **`hebergements_activites`** (nouvelles) | — | « Associer l'hébergement aux évènements/activités proches » |
| **`rate_limits`** (technique) | — | Anti-spam des formulaires, anti brute-force du login |

→ **6 tables métier conservées + 4 tables de support = 10 tables.** À présenter au client comme une amélioration technique, pas comme un changement de périmètre.

**Sous-catégories d'activités** (stockées en `varchar`, validées par Zod, libellés dans les fichiers de traduction) :
- `sport` : `course`, `randonnee`, `cyclisme`, `natation`, `trail`, `autre`
- `tourisme` : `camping`, `kayak`, `equitation`, `sorties_nautiques`, `decouverte_nature`, `autre`

### 3.2 Schéma Drizzle complet

```ts
// src/db/schema.ts
import {
  pgTable, pgEnum, integer, varchar, text, boolean, timestamp, date,
  doublePrecision, jsonb, primaryKey, index,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────
export const sportTypeEnum = pgEnum("sport_type", ["course", "randonnee", "cyclisme", "natation", "autre"]);
export const niveauEnum = pgEnum("niveau", ["debutant", "intermediaire", "confirme", "expert"]);
export const categorieActiviteEnum = pgEnum("categorie_activite", ["sport", "tourisme"]);
export const typeHebergementEnum = pgEnum("type_hebergement", ["hotel", "auberge", "motel"]);
export const typeCibleEnum = pgEnum("type_cible", ["evenement", "activite", "hebergement"]);
export const statutDemandeEnum = pgEnum("statut_demande", ["en_attente", "confirme", "annule"]);
export const sujetContactEnum = pgEnum("sujet_contact", ["question_generale", "partenariat", "assistance"]);
export const localeEnum = pgEnum("locale", ["fr", "ar"]);

// ── Colonnes réutilisables ───────────────────────────────────────────
const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
};

const localisation = {
  zone: varchar({ length: 80 }).notNull(),      // ville / wilaya — filtres & proximité
  lieuFr: varchar({ length: 200 }).notNull(),
  lieuAr: varchar({ length: 200 }),
  latitude: doublePrecision(),
  longitude: doublePrecision(),
  mapsUrl: text(),                              // lien Google Maps collé par l'admin
};

const medias = {
  image: text(),                                // couverture (URL Vercel Blob)
  galerie: jsonb().$type<string[]>().default([]).notNull(),
};

// ── Tables métier ────────────────────────────────────────────────────
export const usersAdmin = pgTable("users_admin", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nom: varchar({ length: 120 }).notNull(),
  email: varchar({ length: 160 }).notNull().unique(),
  motDePasseHash: text().notNull(),
  derniereConnexion: timestamp({ withTimezone: true }),
  ...timestamps,
});

export const evenements = pgTable("evenements", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 160 }).notNull().unique(),
  titreFr: varchar({ length: 200 }).notNull(),
  titreAr: varchar({ length: 200 }),
  descriptionFr: text().notNull(),
  descriptionAr: text(),
  programmeFr: text(),
  programmeAr: text(),
  conditionsFr: text(),
  conditionsAr: text(),
  sportType: sportTypeEnum().notNull(),
  niveau: niveauEnum(),
  dateDebut: timestamp({ withTimezone: true }).notNull(),
  dateFin: timestamp({ withTimezone: true }),
  prix: integer(),                              // DZD — null = gratuit
  placesMax: integer(),
  aLaUne: boolean().default(false).notNull(),
  publie: boolean().default(false).notNull(),
  ...localisation,
  ...medias,
  ...timestamps,
}, (t) => [
  index("evenements_date_idx").on(t.dateDebut),
  index("evenements_publie_zone_idx").on(t.publie, t.zone),
]);

export const activites = pgTable("activites", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 160 }).notNull().unique(),
  categoriePrincipale: categorieActiviteEnum().notNull(),
  sousCategorie: varchar({ length: 40 }).notNull(),
  titreFr: varchar({ length: 200 }).notNull(),
  titreAr: varchar({ length: 200 }),
  descriptionFr: text().notNull(),
  descriptionAr: text(),
  dureeFr: varchar({ length: 80 }),             // ex. « 3 heures », « Journée »
  dureeAr: varchar({ length: 80 }),
  equipementFr: text(),
  equipementAr: text(),
  prix: integer(),
  contactOrganisateurNom: varchar({ length: 120 }),
  contactOrganisateurTel: varchar({ length: 30 }),
  contactOrganisateurEmail: varchar({ length: 160 }),
  publie: boolean().default(false).notNull(),
  ...localisation,
  ...medias,
  ...timestamps,
}, (t) => [
  index("activites_categorie_idx").on(t.categoriePrincipale, t.sousCategorie),
  index("activites_publie_zone_idx").on(t.publie, t.zone),
]);

export const hebergements = pgTable("hebergements", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 160 }).notNull().unique(),
  type: typeHebergementEnum().notNull(),
  nomFr: varchar({ length: 200 }).notNull(),
  nomAr: varchar({ length: 200 }),
  descriptionFr: text().notNull(),
  descriptionAr: text(),
  adresse: varchar({ length: 255 }).notNull(),
  telephone: varchar({ length: 30 }),
  email: varchar({ length: 160 }),
  siteWeb: text(),
  tarifIndicatif: integer(),                    // DZD / nuit, « à partir de »
  commodites: jsonb().$type<string[]>().default([]).notNull(), // wifi, parking, piscine, restaurant, clim…
  publie: boolean().default(false).notNull(),
  ...localisation,
  ...medias,
  ...timestamps,
}, (t) => [
  index("hebergements_type_idx").on(t.type),
  index("hebergements_publie_zone_idx").on(t.publie, t.zone),
]);

export const demandesReservations = pgTable("demandes_reservations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  typeCible: typeCibleEnum().notNull(),
  cibleId: integer().notNull(),
  cibleTitre: varchar({ length: 200 }).notNull(),   // copie lisible même si la cible est supprimée
  nomClient: varchar({ length: 120 }).notNull(),
  telephone: varchar({ length: 30 }).notNull(),
  email: varchar({ length: 160 }),
  dateSouhaitee: date(),                            // activité : date souhaitée · hébergement : arrivée
  dateFin: date(),                                  // hébergement : départ
  nbPersonnes: integer().default(1).notNull(),
  remarques: text(),
  statut: statutDemandeEnum().default("en_attente").notNull(),
  noteAdmin: text(),
  locale: localeEnum().default("fr").notNull(),
  ...timestamps,
}, (t) => [
  index("demandes_statut_idx").on(t.statut, t.createdAt),
  index("demandes_cible_idx").on(t.typeCible, t.cibleId),
]);

export const messagesContact = pgTable("messages_contact", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nom: varchar({ length: 120 }).notNull(),
  email: varchar({ length: 160 }).notNull(),
  telephone: varchar({ length: 30 }),
  sujet: sujetContactEnum().notNull(),
  message: text().notNull(),
  lu: boolean().default(false).notNull(),
  locale: localeEnum().default("fr").notNull(),
  ...timestamps,
}, (t) => [index("messages_lu_idx").on(t.lu, t.createdAt)]);

// ── Tables de support ────────────────────────────────────────────────
export const hebergementsEvenements = pgTable("hebergements_evenements", {
  hebergementId: integer().notNull().references(() => hebergements.id, { onDelete: "cascade" }),
  evenementId: integer().notNull().references(() => evenements.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.hebergementId, t.evenementId] })]);

export const hebergementsActivites = pgTable("hebergements_activites", {
  hebergementId: integer().notNull().references(() => hebergements.id, { onDelete: "cascade" }),
  activiteId: integer().notNull().references(() => activites.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.hebergementId, t.activiteId] })]);

export const parametresSite = pgTable("parametres_site", {
  cle: varchar({ length: 60 }).primaryKey(),        // 'accueil' | 'contact' | 'reseaux'
  valeur: jsonb().notNull(),                        // structure typée côté code (Zod)
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const rateLimits = pgTable("rate_limits", {
  cle: varchar({ length: 200 }).primaryKey(),       // ex. "contact:41.200.10.3"
  compteur: integer().default(0).notNull(),
  fenetreDebut: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
```

**Structure de `parametres_site.valeur`** (validée par Zod) :
- `accueil` : `{ heroTitreFr, heroTitreAr, heroSousTitreFr, heroSousTitreAr, presentationFr, presentationAr }`
- `contact` : `{ email, telephone, whatsapp, adresseFr, adresseAr, latitude, longitude }`
- `reseaux` : `{ facebook, instagram, tiktok, youtube }`

**Relations :** pas de `relations()` Drizzle en V1 ; on utilise le query builder (`select … innerJoin …`), plus explicite.

### 3.3 Client DB & configuration drizzle-kit

```ts
// src/db/index.ts
// Pas de `import "server-only"` ici : ce fichier est aussi utilisé par les scripts (seed).
// La protection côté serveur se fait dans lib/queries et lib/actions.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema, casing: "snake_case" });
```

```ts
// drizzle.config.ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED! }, // connexion directe pour les migrations
});
```

```jsonc
// package.json — scripts à ajouter
"typecheck": "tsc --noEmit",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"db:seed": "tsx --env-file=.env.local scripts/seed.ts",
"admin:create": "tsx --env-file=.env.local scripts/create-admin.ts"
```

**À savoir sur le driver HTTP Neon :** pas de transactions interactives. Pour écrire plusieurs choses de façon atomique (ex. hébergement + ses associations), utiliser `db.batch([...])`.

### 3.4 Branches Neon & migrations

| Branche Neon | Usage | Qui y touche |
| :--- | :--- | :--- |
| `dev` | Développement local, seed, tests, MCP Neon | Toi + Claude Code |
| `main` | Production | Migrations manuelles uniquement, après test sur `dev` |

Règles :
1. Toute modification de schéma passe par `db:generate` → relecture du SQL → `db:migrate` sur `dev` → test → `db:migrate` sur `main` au déploiement.
2. **Jamais** `drizzle-kit push` sur `main`.
3. Le MCP Neon sert au développement et aux tests. Ne jamais lui faire exécuter d'écriture sur `main`.
4. Deux URLs par branche : **poolée** (`-pooler` dans l'hôte) → `DATABASE_URL` pour l'app ; **directe** → `DATABASE_URL_UNPOOLED` pour drizzle-kit.

### 3.5 Données de seed (branche `dev`)

- 6 évènements (dont 3 à venir, 2 « à la une », 1 gratuit, 1 passé)
- 8 activités (4 sport, 4 tourisme), sous-catégories variées
- 6 hébergements (2 hôtels, 2 auberges, 2 motels) avec coordonnées GPS plausibles dans la zone ciblée
- Associations hébergements ↔ évènements/activités
- `parametres_site` par défaut
- 5 demandes (statuts variés) et 3 messages pour tester le dashboard
- Textes **FR + vraie traduction AR** (pas de lorem ipsum : on teste le RTL avec du vrai texte)
- Script idempotent, refusé si `NODE_ENV === "production"`

---

## 4. Bilingue FR/AR & RTL

### 4.1 Routing

```ts
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "ar"],
  defaultLocale: "fr",
  localePrefix: "as-needed", // FR : /evenements · AR : /ar/evenements (conforme au plan initial)
});
```

```ts
// src/proxy.ts (Next.js 16 : ce fichier remplace middleware.ts)
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth/session";

const intl = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next(); // contrôle réel : requireAdmin() côté serveur
  }

  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- Le layout `app/[locale]/layout.tsx` pose `<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>`.
- Navigation : toujours `Link`, `useRouter`, `usePathname`, `redirect` depuis `@/i18n/navigation` (créés avec `createNavigation(routing)`), jamais depuis `next/navigation` dans le site public.
- Le **sélecteur de langue** garde la page courante (`/evenements/x` ↔ `/ar/evenements/x`).
- L'admin reste **en français uniquement** (hors `[locale]`), mais chaque contenu se saisit en FR et en AR.

### 4.2 Fichiers de messages

Namespaces : `common`, `nav`, `footer`, `home`, `events`, `activities`, `stays`, `contact`, `forms`, `filters`, `enums`, `errors`, `seo`.

```json
// messages/fr.json (extrait)
{
  "nav": { "home": "Accueil", "events": "Événements", "activities": "Activités", "stays": "Hébergements", "contact": "Contact", "admin": "Espace Admin" },
  "common": { "free": "Gratuit", "seeDetails": "Voir détails", "register": "S'inscrire", "book": "Réserver", "directions": "Itinéraire" },
  "forms": { "submit": "Envoyer la demande", "success": "Demande reçue — en attente de confirmation." },
  "enums": { "sportType": { "course": "Course", "randonnee": "Randonnée", "cyclisme": "Cyclisme", "natation": "Natation", "autre": "Autre" } }
}
```

```json
// messages/ar.json (extrait)
{
  "nav": { "home": "الرئيسية", "events": "الفعاليات", "activities": "الأنشطة", "stays": "أماكن الإقامة", "contact": "اتصل بنا", "admin": "فضاء الإدارة" },
  "common": { "free": "مجاني", "seeDetails": "عرض التفاصيل", "register": "سجّل الآن", "book": "احجز", "directions": "الاتجاهات" },
  "forms": { "submit": "إرسال الطلب", "success": "تم استلام طلبك — في انتظار التأكيد." },
  "enums": { "sportType": { "course": "جري", "randonnee": "مشي جبلي", "cyclisme": "دراجات هوائية", "natation": "سباحة", "autre": "أخرى" } }
}
```

> Les traductions arabes générées doivent être relues par un arabophone (le client ou toi) avant la mise en ligne.

### 4.3 Règles RTL (checklist pour chaque composant)

- [ ] Classes logiques uniquement : `ms-/me-`, `ps-/pe-`, `start-/end-`, `text-start/end`, `border-s/e`, `rounded-s/e`.
- [ ] Icônes directionnelles (flèches, chevrons, « suivant ») : `rtl:-scale-x-100`.
- [ ] Téléphones, e-mails, URLs, prix avec devise : `<bdi>` ou `dir="ltr"` sur l'élément ; champs `tel` et `email` en `dir="ltr"`.
- [ ] Dates et nombres via `Intl` avec la bonne locale.
- [ ] Carrousels/galeries : sens du swipe et ordre inversés en RTL.
- [ ] Carte Google : paramètre `language=ar` sur l'URL d'intégration.
- [ ] Police arabe dédiée (ex. Cairo, Tajawal, IBM Plex Sans Arabic) via `next/font`, interlignage un peu plus grand.
- [ ] Vérification visuelle systématique à **390 px** et **1440 px**, en FR **et** en AR.

### 4.4 Contenu dynamique bilingue et fallback

```ts
// src/lib/content.ts
export function pick(locale: string, fr: string, ar?: string | null) {
  const useAr = locale === "ar" && !!ar?.trim();
  return { text: useAr ? ar! : fr, lang: useAr ? "ar" : "fr", dir: useAr ? "rtl" : "ltr" } as const;
}
```

- Si le contenu AR est vide, on affiche le FR **avec** `lang="fr" dir="ltr"` sur le bloc concerné (pas de texte français mal aligné à droite).
- Dans l'admin, un badge « AR manquant » signale les contenus à traduire.

---

## 5. Intégrer les maquettes Stitch

### 5.1 Récupérer les écrans

**Option A — Export dans le repo (recommandée, fiable, versionnée)**
Pour chaque écran Stitch : ouvrir la vue *Code*, copier le HTML dans `design/stitch/NN-nom/code.html`, et exporter les captures desktop et mobile (`screen-desktop.png`, `screen-mobile.png`). Ajouter `DESIGN.md` si Stitch le fournit. Commit.
> Il arrive que l'export ZIP ne contienne qu'un `design.md` et une capture, sans HTML : dans ce cas, copier le code écran par écran depuis la vue *Code*.

**Option B — Stitch MCP (lecture directe par Claude Code)**
Générer une clé API dans Stitch, puis :
```bash
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \
  --header "X-Goog-Api-Key: TA_CLE_STITCH" --scope local
```
`--scope local` garde la clé hors de git. Vérifier la procédure officielle sur `stitch.withgoogle.com/docs/mcp/setup`. Même avec le MCP, sauvegarder les écrans dans `design/stitch/` pour garder une trace.

### 5.2 Correspondance écrans → routes → composants

| Écran Stitch | Route | Composants à extraire |
| :--- | :--- | :--- |
| Accueil | `/` | Header, Hero, FeaturedEvents + EventCard, ActivitiesTeaser, StaysTeaser + StayCard, Values, Footer |
| Catalogue évènements | `/evenements` | FilterBar, EventCard, Pagination, EmptyState |
| Détail évènement | `/evenements/[slug]` | Gallery, InfoList, DateBadge, MapEmbed, EventRegistrationForm, NearbySuggestions |
| Catalogue activités | `/activites` | CategoryTabs (Sport / Tourisme), FilterBar, ActivityCard |
| Détail activité | `/activites/[slug]` | Gallery, MapEmbed, BookingForm (variante activité) |
| Catalogue hébergements | `/hebergements` | TypeFilter, StayCard |
| Détail hébergement | `/hebergements/[slug]` | Gallery, Amenities, MapEmbed, BookingForm (variante hébergement) |
| Contact | `/contact` | ContactForm, ContactInfo, MapEmbed |
| Admin (si existant) | `/admin/*` | Sinon : shadcn/ui avec les tokens du site |

Si un écran manque (ex. détail activité), Claude le dérive de l'écran le plus proche en réutilisant les mêmes composants.

### 5.3 Procédure de conversion (dans cet ordre)

1. **Tokens d'abord :** extraire la config Tailwind inline de Stitch (couleurs, polices, rayons, ombres) → `@theme` de Tailwind v4 dans `globals.css`. Supprimer le script CDN Tailwind.
2. **Inventaire :** lister les blocs répétés entre écrans → `docs/COMPONENTS.md` **avant** de coder.
3. **Layout une seule fois :** Header + Footer (Stitch les duplique dans chaque écran).
4. **Écran par écran :** HTML → JSX (`class` → `className`, balises auto-fermantes, `style` en objet), découpage en composants, Server Components par défaut, textes → `t("…")`, classes physiques → logiques, `<img>` → `next/image`, icônes → lucide, liens → `Link` de `@/i18n/navigation`.
5. **Données mockées typées** (mêmes types que les requêtes) tant que la base n'est pas prête, puis branchement sur `lib/queries` en Phase 3.
6. **Comparaison visuelle :** capture du rendu vs `screen-*.png`, en FR et AR, mobile et desktop.

### 5.4 Pièges Stitch fréquents

- Config Tailwind via CDN + `<script>` inline → à migrer en v4.
- Material Symbols chargés depuis Google Fonts → remplacer par lucide (ou auto-héberger).
- Images hébergées par Google (`lh3.googleusercontent.com`) → provisoires ; les remplacer par de vraies photos, ne pas les ajouter durablement à `remotePatterns`.
- Classes `ml-`, `left-`, `text-left` partout → casse le RTL.
- Classes `dark:` générées → décider de les garder ou de les supprimer (recommandé : supprimer en V1).
- Faux éléments interactifs (`href="#"`, boutons sans `type`) → vrais liens et formulaires.
- Accessibilité : textes `alt`, `label` liés aux champs, contrastes. Le code Stitch est un échafaudage, pas du code de production.

---

## 6. Configurer Claude Code

### 6.1 Installation & serveurs MCP (J0)

```bash
# Prérequis : Node.js ≥ 20.9 (idéalement la LTS actuelle), Git, Claude Code installé

# 1. Créer le projet
npx create-next-app@latest athlora
#   → TypeScript ✔  ESLint ✔  Tailwind ✔  src/ ✔  App Router ✔  Turbopack ✔  alias @/* ✔
cd athlora

# 2. Neon : configure le MCP Neon + les skills Neon pour Claude Code et lie un projet
npx neon@latest init
#   (alternative MCP seul, via OAuth :)
#   claude mcp add --transport http neon https://mcp.neon.tech/mcp

# 3. Next.js DevTools : erreurs, routes et logs du serveur de dev en direct
claude mcp add next-devtools -- npx -y next-devtools-mcp@latest

# 4. (Optionnel) Stitch MCP — voir §5.1 option B
# 5. (Optionnel) Playwright MCP pour les captures et la QA visuelle
claude mcp add playwright -- npx -y @playwright/mcp@latest

# 6. Lancer Claude Code et vérifier
claude
# puis dans Claude Code : /mcp  → neon ✔  next-devtools ✔
```

**Astuce Next 16 :** Next.js 16 embarque sa documentation (markdown, version exacte installée) dans `node_modules/next/dist/docs/`. Le `CLAUDE.md` demande à Claude de la consulter au lieu de se fier à ses souvenirs de Next 14/15.

### 6.2 `CLAUDE.md` (à créer à la racine — remplace `/init`)

~~~md
# Athlora — instructions pour Claude Code

## Projet
Plateforme bilingue FR/AR de tourisme sportif : évènements, activités (sport/tourisme), hébergements,
formulaires de demande, back-office admin. Livraison le 5 décembre 2026.
Spécification complète : docs/PLAN.md — lis la section concernée avant chaque tâche.
Avancement : docs/PROGRESS.md — mets-le à jour à la fin de chaque tâche importante.

## Stack
Next.js 16 (App Router, TS strict, Turbopack) · Tailwind CSS v4 · shadcn/ui (admin) · lucide-react
Neon Postgres + Drizzle ORM (driver neon-http, casing snake_case) · Zod · next-intl v4
Auth maison : bcryptjs + jose (cookie httpOnly) · Vercel Blob (images) · Google Maps Embed API

## Commandes
npm run dev | lint | typecheck | build
npm run db:generate | db:migrate | db:studio | db:seed | admin:create

## Next.js 16 — règles impératives
- Le fichier de proxy est src/proxy.ts (PAS middleware.ts).
- params, searchParams, cookies(), headers() sont asynchrones : toujours `await`.
- En cas de doute sur une API Next, lis node_modules/next/dist/docs/ (version installée) avant de coder.
- Pas de cacheComponents en V1. Public : ISR + revalidatePath('/', 'layout') après chaque mutation admin.
- Avec next-intl : setRequestLocale(locale) dans chaque layout/page du site public.

## Architecture
- Lectures BDD : src/lib/queries/* ; écritures : src/lib/actions/* (les deux : import "server-only").
- Toute Server Action admin commence par `await requireAdmin()`. Le proxy n'est qu'une redirection optimiste.
- Schémas Zod dans src/lib/validation/*, partagés client/serveur.
- Server Components par défaut ; "use client" seulement si interactivité nécessaire.
- Plusieurs écritures liées : db.batch([...]) (pas de transaction interactive avec neon-http).

## Bilingue & RTL
- Aucun texte d'interface en dur : messages/fr.json et messages/ar.json (mêmes clés dans les deux).
- Classes Tailwind logiques uniquement (ms/me, ps/pe, start/end, text-start/end). Interdit : ml-, mr-, pl-, pr-, left-, right-, text-left, text-right.
- Navigation via @/i18n/navigation, jamais next/navigation dans le site public.
- Contenu BDD : helper pick(locale, fr, ar) avec fallback FR (lang/dir corrects sur le bloc).
- Téléphones/e-mails/URLs : <bdi> ou dir="ltr".

## UI / Stitch
- Les maquettes de référence sont dans design/stitch/ (HTML + captures). Respecte-les fidèlement.
- Réutilise les composants listés dans docs/COMPONENTS.md avant d'en créer un nouveau.
- Images : next/image. Icônes : lucide-react. Pas de CDN externe.

## Sécurité
- Jamais de dangerouslySetInnerHTML. Descriptions en texte brut (whitespace-pre-line).
- Ne lis jamais .env / .env.local ; utilise .env.example pour connaître les variables.
- Jamais de drizzle-kit push. Migrations : db:generate puis db:migrate, après validation humaine.
- Le MCP Neon ne travaille que sur la branche dev.

## Méthode de travail
- Pour toute tâche touchant plus de 3 fichiers : propose un plan et attends la validation.
- Avance par petites étapes. Après chaque étape : npm run lint && npm run typecheck && npm run build.
- Ne dis jamais « terminé » sans avoir lancé ces commandes et vérifié le rendu (FR + AR, mobile + desktop).
- Commits courts et explicites (feat:, fix:, chore:), un commit par étape validée.
~~~

### 6.3 `.claude/settings.json` (permissions partagées)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run dev)",
      "Bash(npm run lint)",
      "Bash(npm run typecheck)",
      "Bash(npm run build)",
      "Bash(npm run db:generate)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ],
    "ask": [
      "Bash(npm run db:migrate)",
      "Bash(npm run db:seed)",
      "Bash(npm install *)",
      "Bash(git push *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.local)",
      "Read(./.env*.local)",
      "Bash(npx drizzle-kit push *)"
    ]
  }
}
```

### 6.4 Skills projet (`.claude/skills/<nom>/SKILL.md`)

Les skills s'appellent avec `/nom` ou se chargent automatiquement quand la demande correspond à leur description.

**`.claude/skills/stitch-convert/SKILL.md`**
```md
---
name: stitch-convert
description: Convertit un écran Stitch de design/stitch/ en composants Next.js 16 bilingues FR/AR. À utiliser pour intégrer une maquette Stitch.
---
Procédure (l'utilisateur indique le dossier de l'écran et la route cible) :
1. Lis code.html et les captures du dossier. Relis docs/COMPONENTS.md.
2. Liste les composants existants réutilisables et ceux à créer ; montre la liste avant de coder.
3. Convertis en JSX : className, balises auto-fermantes, Server Components par défaut.
4. Remplace tout texte par une clé de traduction ajoutée dans messages/fr.json ET messages/ar.json.
5. Remplace les classes physiques par des classes logiques ; ajoute rtl:-scale-x-100 aux icônes directionnelles.
6. <img> → next/image (width/height ou fill + sizes) ; icônes → lucide-react ; liens → Link de @/i18n/navigation.
7. Données : types issus de lib/queries (ou mocks typés si la requête n'existe pas encore).
8. Vérifie : lint, typecheck, build, puis rendu FR et AR à 390 px et 1440 px comparé aux captures.
9. Mets à jour docs/COMPONENTS.md.
```

**`.claude/skills/admin-crud/SKILL.md`**
```md
---
name: admin-crud
description: Génère un CRUD admin complet pour une entité (évènements, activités, hébergements) selon le pattern du projet. À utiliser pour toute nouvelle gestion admin.
---
Pattern de référence : le CRUD Évènements (src/app/admin/(protected)/evenements, src/lib/actions/admin/evenements.ts).
Fichiers à produire pour l'entité X :
- src/lib/validation/X.ts : schéma Zod (FR obligatoire, AR facultatif, slug, publie, médias, localisation).
- src/lib/actions/admin/X.ts : create/update/delete/togglePublish. Chaque action : requireAdmin() en 1re ligne,
  validation Zod, db.batch() si associations, revalidatePath('/', 'layout'), retour { ok, errors }.
- Pages : liste (recherche, pagination, badge « AR manquant », publier/masquer, supprimer avec confirmation),
  nouveau, édition [id]. Formulaire avec onglets Français | العربية (champs AR en dir="rtl"), ImageUploader,
  lat/lng + lien Google Maps, slug auto depuis le titre FR (modifiable).
Checklist finale : lint, typecheck, build ; tester création, édition, publication, suppression, sur mobile et desktop ;
vérifier que la page publique reflète le changement.
```

**`.claude/skills/i18n-rtl-audit/SKILL.md`**
```md
---
name: i18n-rtl-audit
description: Audite le bilingue FR/AR et le RTL du site public. À utiliser avant chaque démo et en phase QA.
---
1. Compare les clés de messages/fr.json et messages/ar.json : liste les clés manquantes ou vides de chaque côté.
2. Cherche dans src/ les classes physiques interdites (ml-, mr-, pl-, pr-, left-, right-, text-left, text-right,
   rounded-l, rounded-r, border-l, border-r) et les textes en dur dans le JSX.
3. Cherche les imports de next/navigation dans src/app/[locale] et src/components (hors admin).
4. Vérifie la présence de <bdi>/dir="ltr" autour des téléphones, e-mails et prix.
5. Si Playwright est disponible : captures de chaque page publique en /fr et /ar à 390 px et 1440 px.
6. Produis un rapport priorisé (bloquant / important / cosmétique) puis propose les corrections.
```

### 6.5 Subagents (`.claude/agents/<nom>.md`)

**`.claude/agents/security-reviewer.md`**
```md
---
name: security-reviewer
description: Relit le code pour trouver des failles (auth, server actions, upload, requêtes, XSS, secrets). À utiliser avant la mise en production et après tout changement sur l'auth ou l'admin.
tools: Read, Grep, Glob
---
Tu es un relecteur sécurité pour une app Next.js 16 + Drizzle + Neon.
Vérifie en priorité :
- Chaque Server Action et route API admin appelle requireAdmin() avant toute lecture/écriture.
- Toutes les entrées passent par Zod côté serveur (même si validées côté client).
- Aucune requête SQL brute construite par concaténation.
- Aucun dangerouslySetInnerHTML ; pas d'URL utilisateur injectée dans href sans validation (javascript:).
- Cookie de session : httpOnly, secure en prod, sameSite lax, expiration.
- Upload : authentification, types MIME et taille limités.
- Rate-limit sur login et formulaires publics ; message d'erreur de login générique.
- Aucun secret dans le code ou dans les variables NEXT_PUBLIC_* sauf la clé Maps restreinte.
Rends un rapport : fichier:ligne, gravité (critique/haute/moyenne/basse), correctif proposé. Ne modifie rien.
```

**`.claude/agents/rtl-reviewer.md`**
```md
---
name: rtl-reviewer
description: Vérifie qu'un composant ou une page s'affiche correctement en arabe (RTL). À utiliser après chaque nouvel écran.
tools: Read, Grep, Glob
---
Analyse les fichiers indiqués et signale : classes physiques, icônes directionnelles non inversées,
textes en dur, nombres/téléphones sans isolation bidi, mises en page qui supposent une lecture gauche→droite
(ex. positionnement absolu à gauche, ordre flex forcé). Rapport court avec corrections précises. Ne modifie rien.
```

### 6.6 Règles d'or du travail avec Claude Code

1. **Mode plan d'abord** (Shift+Tab) pour toute tâche de plus de 3 fichiers : Claude propose, tu valides, puis il exécute.
2. **Une tâche = un contexte propre :** `/clear` entre deux sujets sans rapport. Les prompts du §7 sont conçus pour fonctionner après un `/clear`.
3. **Petites étapes vérifiables :** lint + typecheck + build + coup d'œil au rendu → commit. Ne jamais empiler 5 features sans commit.
4. **Une branche git par phase** (`feat/phase-3-pages`), merge sur `main` → déploiement Vercel automatique.
5. **Donne des images à Claude :** captures Stitch vs captures du rendu. C'est la façon la plus rapide d'obtenir une fidélité visuelle.
6. **Retour arrière :** Échap pour interrompre ; les checkpoints (Échap Échap ou `/rewind`) pour revenir avant une mauvaise modification ; git pour le reste.
7. **Secrets :** jamais dans le chat. Uniquement dans `.env.local` (lecture interdite à Claude) et dans Vercel.
8. **Fin de journée :** « Mets à jour docs/PROGRESS.md : fait, reste à faire, décisions prises, problèmes ouverts. » Le lendemain : « Lis docs/PROGRESS.md et reprends. »

---

## 7. Plan d'exécution jour par jour

> Le planning compte les 10 jours calendaires, week-end inclus. Si tu ne travailles pas un jour, décale et applique le plan B (§12) dès que le retard dépasse une demi-journée.

| Jour | Date | Phase | Livrable principal |
| :--- | :--- | :--- | :--- |
| J0 | mer. 25/11 | 0 — Préparation | Comptes, exports Stitch, Claude Code + MCP prêts |
| J1 | jeu. 26/11 | 1 — Fondations | Squelette FR/AR + design system + Header/Footer, **déployé** |
| J2 | ven. 27/11 | 2 — Base de données | Schéma, migrations, seed, requêtes typées |
| J3 | sam. 28/11 | 3a — Pages publiques | Accueil + Évènements (catalogue + détail) |
| J4 | dim. 29/11 | 3b — Pages publiques | Activités + Hébergements + Contact |
| J5 | lun. 30/11 | 4 — Formulaires | 4 formulaires → base, anti-spam ; **contenu client reçu** |
| J6 | mar. 01/12 | 5a — Admin | Auth, dashboard, CRUD Évènements (pattern), upload |
| J7 | mer. 02/12 | 5b — Admin | CRUD Activités/Hébergements, Demandes, Messages, Paramètres |
| J8 | jeu. 03/12 | 6 — QA | Audit RTL, sécurité, SEO, perf, tests |
| J9 | ven. 04/12 | 7 — Production | Prod Neon + Vercel, domaine, contenu réel, recette client |
| J10 | sam. 05/12 | Livraison | Guide admin, formation, passation des accès |

---

### Phase 0 — Préparation (J0, mer. 25/11)

**Tâches**
- [ ] GitHub : repo privé `athlora`.
- [ ] Neon : projet `athlora`, région **AWS Europe (Frankfurt)**, branche `dev` créée depuis `main`. Récupérer les 4 URLs (poolée + directe, pour `dev` et `main`).
- [ ] Vercel : compte et décision de plan (§11.3). Ne pas encore importer le repo.
- [ ] Google Cloud : activer **Maps Embed API**, créer une clé restreinte par référents HTTP (localhost, domaine de preview, domaine final) et à cette seule API.
- [ ] Stitch : exporter tous les écrans dans `design/stitch/` (§5.1).
- [ ] Envoyer au client la **liste de contenu à fournir** (§13.1) avec une date limite au J5.
- [ ] Installer Claude Code + MCP (§6.1), créer `CLAUDE.md`, `.claude/settings.json`, skills et agents (§6.2 à 6.5), copier ce plan dans `docs/PLAN.md`.

**Definition of Done :** `claude` lancé dans le dossier, `/mcp` affiche neon ✔ et next-devtools ✔, `design/stitch/` contient tous les écrans, premier commit poussé.

---

### Phase 1 — Fondations (J1, jeu. 26/11)

**Prompt 1.1 — Installation & structure**
```text
Lis CLAUDE.md puis docs/PLAN.md sections 1, 2 et 4.
Objectif : poser les fondations du projet, sans aucune page métier.
1. Installe : next-intl, zod, lucide-react, drizzle-orm, @neondatabase/serverless, jose, bcryptjs, @vercel/blob ;
   en dev : drizzle-kit, tsx, dotenv, @types/bcryptjs. Initialise shadcn/ui (init seulement).
2. Configure next-intl selon la section 4.1 (routing.ts, navigation.ts, request.ts, proxy.ts sans la partie admin
   pour l'instant, plugin dans next.config.ts).
3. Crée l'arborescence de la section 2.2 (dossiers + fichiers squelettes).
4. Crée src/app/layout.tsx (passe-plat), src/app/[locale]/layout.tsx avec lang/dir dynamiques, police FR (celle des
   maquettes Stitch) et police arabe via next/font, NextIntlClientProvider, setRequestLocale, generateStaticParams.
5. Crée messages/fr.json et messages/ar.json avec les namespaces de la section 4.2.
6. Ajoute les scripts npm de la section 3.3 et crée .env.example selon la section 11.2.
Propose d'abord ton plan et attends ma validation. Ensuite exécute, lance lint + typecheck + build et montre le résultat.
```

**Prompt 1.2 — Design system depuis Stitch**
```text
Lis tous les fichiers de design/stitch/ (HTML et captures) et la section 5 de docs/PLAN.md.
1. Extrais les tokens (couleurs, polices, tailles, rayons, ombres, espacements récurrents) de la config Tailwind
   inline de Stitch et transpose-les en Tailwind v4 dans src/styles/globals.css (@theme). Aucune dépendance au CDN.
2. Fais l'inventaire des composants répétés entre les écrans et écris-le dans docs/COMPONENTS.md
   (nom, écrans concernés, props prévues, Server ou Client Component).
3. Signale-moi les écrans manquants par rapport au tableau 5.2.
Ne code aucune page pour l'instant.
```

**Prompt 1.3 — Header, Footer, sélecteur de langue**
```text
Utilise le skill stitch-convert sur l'écran design/stitch/01-accueil pour implémenter uniquement :
- Header : logo Athlora, 5 liens, sélecteur FR/AR qui conserve la page courante, lien discret « Espace Admin »,
  menu mobile (drawer). Lien actif mis en évidence.
- Footer : présentation, liens rapides, coordonnées, réseaux sociaux, emplacement carte (MapEmbed viendra plus tard).
Crée une page d'accueil provisoire avec seulement Header + Footer.
Vérifie le rendu en / et /ar, à 390 px et 1440 px, et compare aux captures Stitch.
```

**Puis (toi) :** importer le repo dans Vercel, région des fonctions `fra1`, variables d'environnement (même partielles), premier déploiement.

**Definition of Done**
- [ ] `/` et `/ar` s'affichent, `dir="rtl"` actif en arabe, menu mobile fonctionnel.
- [ ] Tokens Stitch appliqués, aucune requête vers un CDN Tailwind.
- [ ] `docs/COMPONENTS.md` rempli.
- [ ] URL de preview Vercel fonctionnelle (à montrer au client dès ce soir).

---

### Phase 2 — Base de données (J2, ven. 27/11)

**Prompt 2.1 — Schéma & migrations**
```text
Lis docs/PLAN.md section 3.
Crée src/db/schema.ts exactement selon 3.2, src/db/index.ts et drizzle.config.ts selon 3.3.
Lance npm run db:generate et montre-moi le SQL généré. Après mon accord, applique-le sur la branche Neon dev
avec npm run db:migrate. Vérifie ensuite via le MCP Neon (branche dev uniquement) que les 10 tables existent.
```

**Prompt 2.2 — Seed & création d'admin**
```text
Écris scripts/seed.ts selon la section 3.5 : contenu réaliste en français ET en arabe (vraie traduction),
coordonnées GPS plausibles dans la zone <ZONE À PRÉCISER>, images provisoires locales (public/seed/).
Le script vide les tables puis insère ; il refuse de s'exécuter si NODE_ENV === "production".
Écris scripts/create-admin.ts : lit ADMIN_NOM, ADMIN_EMAIL, ADMIN_PASSWORD, refuse un mot de passe de moins
de 12 caractères, hash bcrypt coût 12, met à jour si l'email existe déjà.
Lance le seed sur dev après mon accord.
```

**Prompt 2.3 — Couche de requêtes**
```text
Crée src/lib/queries/* (import "server-only"), avec types de retour exportés :
- evenements : listPublished({ sport, zone, periode: "a_venir" | "passes", page }), getBySlug(slug),
  getFeatured(limit = 3 : à venir, a_la_une d'abord puis par date), getNearby(evenementId) →
  hébergements associés + activités publiées de la même zone (max 3 chacun).
- activites : listPublished({ categorie, sousCategorie, zone, page }), getBySlug, getNearby(activiteId).
- hebergements : listPublished({ type, zone, evenementId, page }), getBySlug.
- parametres : get(cle) avec valeurs par défaut typées par Zod.
- dashboard : 4 compteurs + 10 dernières demandes.
- zones : liste distincte des zones publiées (pour les filtres).
Public : toujours publie = true. Pagination : 9 éléments par page. Écris un petit script de vérification qui
appelle chaque fonction et affiche le nombre de résultats.
```

**Definition of Done**
- [ ] 10 tables sur `dev`, migration versionnée dans `drizzle/`.
- [ ] Seed OK, visible dans `npm run db:studio`.
- [ ] Requêtes typées, script de vérification OK.

---

### Phase 3a — Accueil & Évènements (J3, sam. 28/11)

**Prompt 3.1 — MapEmbed & utilitaires**
```text
Crée :
- src/lib/maps.ts : embedUrl({ lat, lng, adresse, locale }) → https://www.google.com/maps/embed/v1/place
  ?key=NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY&q=<lat,lng ou adresse encodée>&language=<locale> ;
  directionsUrl(lat, lng) → https://www.google.com/maps/dir/?api=1&destination=<lat,lng>.
- components/shared/MapEmbed : iframe lazy, referrerPolicy="no-referrer-when-downgrade", title traduit,
  hauteur min 280 px, bouton « Itinéraire ». Si ni coordonnées ni adresse : ne rien afficher.
- lib/format.ts : formatPrix (DZD, « Gratuit » si null), formatDate et formatPeriode via Intl selon la locale.
- components/shared : DateBadge, PriceTag, EmptyState, Pagination (basée sur searchParams).
```

**Prompt 3.2 — Accueil**
```text
Utilise le skill stitch-convert sur design/stitch/01-accueil pour la page d'accueil complète :
Hero (2 boutons : Découvrir les évènements, Explorer les activités) dont les textes viennent de
parametres_site.accueil avec fallback messages ; Évènements à la une (getFeatured) ; Découverte des activités
(un bloc Sport, un bloc Tourisme, avec lien vers l'onglet correspondant) ; Hébergements (3) ; Valeurs (3 blocs).
ISR revalidate = 300, setRequestLocale, generateMetadata localisé.
```

**Prompt 3.3 — Évènements**
```text
Implémente /evenements et /evenements/[slug] depuis les écrans Stitch correspondants.
Catalogue : FilterBar (Client Component minimal qui met à jour l'URL) : type de sport, zone, à venir / passés.
EventCard : photo, titre, DateBadge, lieu, PriceTag, bouton « Voir détails / S'inscrire ». EmptyState si aucun résultat.
Détail : Gallery (lightbox simple, swipe mobile, sens inversé en RTL), description, programme, niveau, conditions,
infos pratiques, MapEmbed, emplacement réservé au formulaire d'inscription (Phase 4), NearbySuggestions
(hébergements + activités). notFound() si slug inconnu ou non publié. generateMetadata avec image OG.
Vérifie FR/AR, mobile/desktop, puis commit.
```

**Definition of Done**
- [ ] Accueil fidèle à Stitch avec données réelles de la base.
- [ ] Filtres évènements fonctionnels et partageables par URL.
- [ ] Fiche évènement complète, carte affichée, 404 propre.

---

### Phase 3b — Activités, Hébergements, Contact (J4, dim. 29/11)

**Prompt 3.4 — Activités**
```text
Implémente /activites et /activites/[slug].
Catalogue : CategoryTabs (Activités sportives / Activités touristiques) piloté par ?categorie=sport|tourisme,
filtres secondaires sous-catégorie (dépend de l'onglet) et zone. ActivityCard.
Détail : Gallery, description, durée, équipement recommandé, contact organisateur (téléphone cliquable, en <bdi>),
MapEmbed, emplacement du formulaire (Phase 4), hébergements proches.
```

**Prompt 3.5 — Hébergements**
```text
Implémente /hebergements et /hebergements/[slug].
Catalogue : filtre type (Tous | Hôtels | Auberges | Motels), filtre zone, filtre « proche de l'évènement » (liste
des évènements à venir). StayCard : photo, badge type, adresse, tarif indicatif « à partir de », bouton Réserver / Contacter.
Détail : Gallery, commodités (icônes + libellés traduits), adresse complète, téléphone/email/site, MapEmbed,
emplacement du formulaire (Phase 4).
```

**Prompt 3.6 — Contact & finitions**
```text
Implémente /contact (coordonnées depuis parametres_site.contact, MapEmbed, emplacement du formulaire).
Ajoute le MapEmbed dans le Footer. Crée les pages not-found FR/AR. Lance le skill i18n-rtl-audit sur tout le
site public et corrige les points bloquants et importants.
```

**Definition of Done**
- [ ] Les 5 rubriques publiques fonctionnent avec les données de seed.
- [ ] Audit i18n/RTL sans point bloquant.
- [ ] Déploiement preview à jour, lien envoyé au client pour premier retour.

---

### Phase 4 — Formulaires & interactions (J5, lun. 30/11)

**Prompt 4.1 — Infrastructure formulaires**
```text
Crée l'infrastructure commune des formulaires publics :
- lib/rate-limit.ts : fenêtre fixe sur la table rate_limits (upsert), fonction check(cle, max, fenetreMs).
  IP lue via headers() (x-forwarded-for, première valeur).
- lib/phone.ts : validation téléphone algérien ^(?:\+213|0)(?:[5-7]\d{8}|[2-4]\d{7})$ (espaces et tirets
  ignorés), normalisation en +213… ; accepter aussi un format international générique si l'utilisateur commence par +.
- components/forms/FormField : label, champ, message d'erreur traduit, aria-invalid / aria-describedby.
- Champ honeypot caché commun (nom neutre, tabIndex -1, autocomplete off) : si rempli → réponse « succès » factice
  sans écriture en base.
- Messages d'erreur Zod traduits via next-intl (namespace errors).
```

**Prompt 4.2 — Les 4 formulaires**
```text
Implémente avec Server Actions + useActionState + schémas Zod partagés (lib/validation) :
1. EventRegistrationForm (fiche évènement) : nom complet, téléphone, email, nombre de participants (1 à 20 ;
   ne pas dépasser places_max si défini), remarques → demandes_reservations (type_cible = evenement,
   date_souhaitee = date de l'évènement).
2. BookingForm variante activité : nom, téléphone, email, date souhaitée (≥ aujourd'hui), nombre de personnes.
3. BookingForm variante hébergement : nom, téléphone, email, date d'arrivée (≥ aujourd'hui), date de départ
   (> arrivée), nombre de personnes.
4. ContactForm : nom, email, téléphone (facultatif), sujet (enum), message (20 à 2000 caractères) → messages_contact.
Pour tous : rate-limit 5 envois / 10 min / IP, vérification côté serveur que la cible existe et est publiée,
cible_titre copié, locale enregistrée, statut en_attente, état de succès « Demande reçue — en attente de
confirmation » qui remplace le formulaire, bouton désactivé pendant l'envoi.
Teste chaque formulaire en FR et AR, y compris les erreurs, puis vérifie les lignes en base (branche dev).
```

**Prompt 4.3 — Bonus si le temps le permet**
```text
Après chaque nouvelle demande ou message, envoie un e-mail de notification à ADMIN_NOTIFY_EMAIL via Resend
(sans bloquer la réponse à l'utilisateur ; en cas d'échec, simple log). Ne fais rien si RESEND_API_KEY est absent.
```

**Definition of Done**
- [ ] Les 4 formulaires écrivent en base avec le bon statut.
- [ ] Honeypot + rate-limit vérifiés.
- [ ] Erreurs traduites et lisibles en arabe.
- [ ] **Contenu réel du client reçu** (sinon : déclencher le plan B, §12).

---

### Phase 5a — Back-office : socle (J6, mar. 01/12)

**Prompt 5.1 — Authentification admin**
```text
Implémente l'auth admin selon docs/PLAN.md section 8.2 :
- lib/auth/password.ts (bcryptjs, coût 12) ; lib/auth/session.ts (jose HS256, SESSION_SECRET, cookie
  "athlora_session" httpOnly, secure en production, sameSite lax, path /, 7 jours, payload { sub, email }) ;
  lib/auth/require-admin.ts (import "server-only" : lit le cookie, vérifie le JWT ET l'existence de l'admin en base,
  sinon redirect("/admin/login") ; retourne l'admin).
- Complète proxy.ts avec la redirection optimiste /admin/* (section 4.1).
- /admin/login : email + mot de passe, message d'erreur générique, rate-limit 5 tentatives / 15 min par IP+email,
  mise à jour de derniere_connexion, redirection vers /admin. Action de déconnexion (supprime le cookie).
- src/app/admin/layout.tsx (html lang fr) et (protected)/layout.tsx : requireAdmin() + Sidebar responsive
  (drawer sur mobile) avec badges « demandes en attente » et « messages non lus ».
Teste : accès sans cookie, mauvais mot de passe, rate-limit, cookie falsifié, déconnexion.
```

**Prompt 5.2 — Dashboard**
```text
Implémente /admin : 4 StatCard (Total Évènements, Total Activités, Total Hébergements, Demandes en attente),
liste des 10 dernières demandes et messages (date, type, cible, client, statut, lien vers le détail).
Rafraîchissement automatique toutes les 60 s (petit Client Component qui appelle router.refresh()).
```

**Prompt 5.3 — Upload d'images**
```text
Implémente l'upload direct navigateur → Vercel Blob :
- src/app/api/upload/route.ts avec handleUpload de @vercel/blob/client ; dans onBeforeGenerateToken :
  requireAdmin (sans redirect : renvoyer une erreur 401), types autorisés image/jpeg, image/png, image/webp,
  taille max 4 Mo, chemin athlora/<entite>/<identifiant-aleatoire>.<ext>.
- components/admin/ImageUploader (client) : couverture + galerie, aperçu, suppression, réordonnancement simple
  (flèches), compression navigateur si > 1,5 Mo, états de chargement et d'erreur.
- Ajoute le domaine Vercel Blob dans images.remotePatterns de next.config.ts.
```

**Prompt 5.4 — CRUD Évènements (pattern de référence)**
```text
Implémente le CRUD Évènements complet selon le skill admin-crud (c'est le modèle pour les autres entités) :
liste (recherche par titre, filtre publié/masqué, pagination, badges « À la une » et « AR manquant »,
actions modifier / publier-masquer / supprimer avec ConfirmDialog), page nouveau, page édition.
Formulaire : onglets Français | العربية, sport, niveau, dates début/fin, prix (vide = gratuit), places max,
zone, lieu FR/AR, lat/lng + lien Google Maps (si l'admin colle un lien contenant des coordonnées, les extraire),
ImageUploader, à la une, publié, multi-select des hébergements proches.
Server Actions : requireAdmin(), Zod, db.batch() pour l'évènement + hebergements_evenements,
revalidatePath('/', 'layout'), toast de confirmation. Une fois validé, mets à jour le skill admin-crud
avec les chemins et détails réels du pattern.
```

**Definition of Done**
- [ ] Impossible d'atteindre une page ou une action admin sans session valide.
- [ ] Dashboard OK sur mobile.
- [ ] CRUD Évènements complet, changements visibles côté public immédiatement.

---

### Phase 5b — Back-office : reste des modules (J7, mer. 02/12)

**Prompt 5.5 — CRUD Activités & Hébergements**
```text
Avec le skill admin-crud, implémente le CRUD Activités (catégorie principale → sous-catégories dépendantes,
durée FR/AR, équipement FR/AR, prix, contact organisateur, hébergements proches) puis le CRUD Hébergements
(type, nom FR/AR, adresse, téléphone, email, site, tarif indicatif, commodités en cases à cocher,
évènements et activités proches). Même niveau de finition que les Évènements.
```

**Prompt 5.6 — Demandes & Messages**
```text
Implémente /admin/demandes avec 3 onglets : Inscriptions Évènements | Demandes Activités & Hébergements |
Messages Contact.
- Demandes : filtres statut et période, tri par date, détail en panneau latéral (toutes les infos, cible avec lien
  vers la page publique), changement de statut En attente → Confirmée / Annulée, note interne admin.
- Contact rapide : boutons Appeler (tel:), E-mail (mailto: avec objet pré-rempli), WhatsApp
  (https://wa.me/<numéro sans + ni 0 initial> avec message pré-rempli dans la langue de la demande).
- Messages : marquer lu/non lu, répondre par e-mail, badge non lus dans la Sidebar.
- Bonus : export CSV de l'onglet courant.
```

**Prompt 5.7 — Paramètres du site**
```text
Implémente /admin/parametres : textes de l'accueil FR/AR (parametres_site.accueil), coordonnées et carte
(parametres_site.contact), réseaux sociaux (parametres_site.reseaux), et un bloc « Mon compte » : changement
d'email et de mot de passe (mot de passe actuel requis, nouveau ≥ 12 caractères, confirmation).
Validation Zod, revalidatePath('/', 'layout').
```

**Definition of Done**
- [ ] Les 6 modules admin du plan initial sont fonctionnels.
- [ ] Parcours complet testé : un visiteur fait une demande → l'admin la voit → la confirme → contacte le client sur WhatsApp.

---

### Phase 6 — QA, sécurité, SEO (J8, jeu. 03/12)

**Prompt 6.1 — Audit sécurité**
```text
Utilise le subagent security-reviewer sur src/ et next.config.ts. Présente-moi le rapport priorisé,
puis corrige les points critiques et hauts après mon accord. Vérifie aussi la checklist de la section 8.
```

**Prompt 6.2 — Audit bilingue**
```text
Lance le skill i18n-rtl-audit sur tout le site public et l'admin (formulaires bilingues), puis le subagent
rtl-reviewer sur les composants signalés. Corrige tout ce qui est bloquant ou important.
```

**Prompt 6.3 — SEO**
```text
Implémente le SEO selon la section 9 : generateMetadata localisé partout (title, description, OG image),
alternates.languages (hreflang fr/ar + x-default), src/app/sitemap.ts (pages statiques + fiches publiées,
dans les deux langues), src/app/robots.ts (interdit /admin et /api), JSON-LD schema.org Event sur les fiches
évènements et LodgingBusiness sur les hébergements, favicon et image OG par défaut.
```

**Prompt 6.4 — Performance & tests**
```text
1. Optimise : priority sur l'image du Hero, sizes corrects sur toutes les next/image, polices avec subsets
   adaptés, pas de Client Component inutile, iframes Maps en lazy.
2. Ajoute les en-têtes de sécurité de la section 8.4 dans next.config.ts.
3. Écris 5 tests Playwright « smoke » : accueil FR et AR ; filtre évènements ; envoi d'une demande hébergement ;
   login admin + changement de statut d'une demande ; création puis suppression d'un évènement.
4. Lance npm run build et signale tout avertissement.
```

**Definition of Done**
- [ ] Aucun point critique/haut ouvert dans l'audit sécurité.
- [ ] Audit RTL sans point bloquant.
- [ ] Tests smoke verts. Objectif Lighthouse mobile ≥ 90 en performance et accessibilité sur l'accueil.

---

### Phase 7 — Production (J9, ven. 04/12)

**Tâches (toi + Claude Code)**
- [ ] `npm install next@latest` (Next publie des correctifs de sécurité réguliers), re-build, re-test.
- [ ] Neon `main` : `db:migrate` avec l'URL directe de `main` ; **pas de seed** ; `admin:create` pour le compte du client.
- [ ] Vercel : variables d'environnement **Production** (§11.2), région `fra1`, domaine + HTTPS, redirection `www`.
- [ ] Google Maps : ajouter le domaine final dans les restrictions de la clé.
- [ ] Contenu réel : saisie via l'admin **ou** import par script (prompt 7.1).
- [ ] Recette avec le client (checklist §10), corrections à chaud.

**Prompt 7.1 — Import du contenu client (si fourni en tableur)**
```text
Le client a fourni ses contenus dans data/contenu.xlsx (ou .csv) : onglets Evenements, Activites, Hebergements.
Écris scripts/import-contenu.ts qui valide chaque ligne avec les schémas Zod existants, génère les slugs,
liste les erreurs ligne par ligne sans rien écrire, puis n'écrit en base qu'avec l'option --confirm.
Les éléments importés sont en publie = false pour relecture dans l'admin.
```

**Definition of Done**
- [ ] Site en production sur le domaine final, HTTPS, FR/AR.
- [ ] Compte admin client fonctionnel, contenu réel en ligne.
- [ ] Recette signée (ou liste de réserves mineures).

---

### J10 — Livraison (sam. 05/12)

**Prompt 10.1 — Guide administrateur**
```text
Rédige docs/GUIDE_ADMIN.md en français simple, pour un utilisateur non technique : se connecter, ajouter / modifier /
masquer un évènement, une activité, un hébergement, gérer les photos, traiter une demande (statuts, contact
WhatsApp), lire les messages, modifier les textes de l'accueil et les coordonnées, changer son mot de passe,
bonnes pratiques (taille des photos, traduction arabe). Prévois des emplacements [CAPTURE] que je remplirai.
```

Voir aussi §13 pour la passation.

---

## 8. Sécurité

### 8.1 Entrées / sorties
- [ ] Zod **côté serveur** sur 100 % des Server Actions et routes API (la validation client n'est qu'un confort).
- [ ] Drizzle uniquement (requêtes paramétrées). Si `sql\`\`` est nécessaire : uniquement avec des valeurs interpolées par Drizzle, jamais de concaténation.
- [ ] Pas de `dangerouslySetInnerHTML` ; React échappe tout par défaut.
- [ ] URLs saisies par l'admin (site web, réseaux, lien Maps) validées en `https://` uniquement.
- [ ] Les Server Actions de Next.js vérifient l'origine de la requête (protection CSRF intégrée) : ne pas désactiver ce comportement.

### 8.2 Authentification admin
- [ ] Mots de passe hachés avec bcrypt, coût 12, minimum 12 caractères.
- [ ] `SESSION_SECRET` ≥ 32 caractères aléatoires (`openssl rand -base64 32`), différent entre dev et prod.
- [ ] Cookie `httpOnly`, `secure` en prod, `sameSite=lax`, expiration 7 jours.
- [ ] `requireAdmin()` dans le layout protégé **et** dans chaque Server Action / route admin (le proxy seul ne suffit pas).
- [ ] Message d'erreur de login générique (« identifiants incorrects »), rate-limit 5 essais / 15 min.
- [ ] Pas de page d'inscription admin ; création uniquement via `admin:create`.

```ts
// src/lib/auth/session.ts (squelette)
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "athlora_session";
const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSessionToken(payload: { sub: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}
```

### 8.3 Upload
- [ ] Route d'upload protégée par l'auth admin.
- [ ] Types limités à JPEG / PNG / WebP, 4 Mo max, noms de fichiers aléatoires.

### 8.4 Infrastructure
- [ ] En-têtes dans `next.config.ts` : `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` restrictive. (Une CSP stricte avec nonces est reportée en V2.)
- [ ] Secrets uniquement dans Vercel et `.env.local` (jamais commités ; `.env.example` sans valeurs).
- [ ] Seule variable publique sensible : la clé Maps, **restreinte** par domaine et par API.
- [ ] Next.js à jour du dernier correctif de sécurité au moment de la mise en production.
- [ ] `robots.txt` interdit `/admin` (ce n'est pas une protection, juste de l'hygiène).

---

## 9. SEO, performance, accessibilité

**SEO**
- Métadonnées localisées sur chaque page ; `hreflang` fr / ar / x-default.
- `sitemap.xml` dynamique (pages + fiches publiées × 2 langues), `robots.txt`.
- URLs lisibles via `slug`.
- JSON-LD : `Event` (nom, dates, lieu, prix, organisateur) pour les évènements, `LodgingBusiness` pour les hébergements.
- Images OG par fiche (image de couverture) et une image par défaut.

**Performance**
- Neon et les fonctions Vercel dans la même région (Frankfurt / `fra1`).
- ISR sur le public, `next/image` partout (`priority` sur le Hero uniquement), polices `next/font`, iframes Maps en `loading="lazy"`.
- Images uploadées compressées côté navigateur.

**Accessibilité**
- Labels liés à tous les champs, erreurs annoncées (`aria-describedby`), focus visible.
- Textes `alt` saisis dans l'admin (ou titre de la fiche par défaut).
- Contrastes vérifiés sur la palette Stitch.
- Navigation clavier sur le menu mobile, la galerie et les onglets.

---

## 10. QA & recette

### 10.1 Matrice de test

| Parcours | FR mobile | FR desktop | AR mobile | AR desktop |
| :--- | :---: | :---: | :---: | :---: |
| Accueil : sections, CTA, liens | ☐ | ☐ | ☐ | ☐ |
| Évènements : filtres, pagination, vide | ☐ | ☐ | ☐ | ☐ |
| Fiche évènement : galerie, carte, suggestions | ☐ | ☐ | ☐ | ☐ |
| Inscription évènement (succès + erreurs) | ☐ | ☐ | ☐ | ☐ |
| Activités : onglets, sous-catégories | ☐ | ☐ | ☐ | ☐ |
| Demande activité | ☐ | ☐ | ☐ | ☐ |
| Hébergements : filtres type / zone / évènement | ☐ | ☐ | ☐ | ☐ |
| Demande hébergement (dates arrivée/départ) | ☐ | ☐ | ☐ | ☐ |
| Contact | ☐ | ☐ | ☐ | ☐ |
| Sélecteur de langue (garde la page) | ☐ | ☐ | ☐ | ☐ |
| Admin : login, CRUD ×3, demandes, paramètres | ☐ | ☐ | — | — |

**Navigateurs :** Chrome Android, Safari iOS, Chrome et Firefox desktop.

### 10.2 Cas limites à tester
- Contenu AR absent → fallback FR correctement aligné.
- Titres très longs (FR et AR), description vide, fiche sans image, fiche sans coordonnées.
- Évènement passé, évènement gratuit, évènement complet (`places_max`).
- Double clic sur « Envoyer », 6e envoi en 10 minutes, honeypot rempli.
- Suppression d'un hébergement lié à un évènement (associations supprimées, demandes conservées grâce à `cible_titre`).
- Session expirée pendant l'édition d'un formulaire admin.

---

## 11. Déploiement production

### 11.1 Étapes
1. Neon `main` : appliquer les migrations (URL directe de `main`), créer l'admin du client.
2. Vercel : projet lié au repo GitHub, région des fonctions `fra1`, variables d'environnement par environnement (Production / Preview / Development), Vercel Blob activé.
3. Domaine : DNS vers Vercel, HTTPS automatique, redirection `www` → domaine nu (ou l'inverse).
4. Vérifications finales : formulaires en prod, upload en prod, carte sur le domaine final, sitemap accessible.

### 11.2 Variables d'environnement (`.env.example`)

| Variable | Exemple / format | Utilisée par |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://…@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require` | App (runtime) |
| `DATABASE_URL_UNPOOLED` | même chose sans `-pooler` | drizzle-kit (migrations) |
| `SESSION_SECRET` | 32+ caractères aléatoires | Auth |
| `BLOB_READ_WRITE_TOKEN` | fourni par Vercel Blob | Upload |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | `AIza…` (restreinte) | Cartes |
| `NEXT_PUBLIC_SITE_URL` | `https://athlora.com` | SEO, URLs absolues |
| `ADMIN_NOM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | — | Script `admin:create` uniquement (jamais sur Vercel) |
| `RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL` | optionnel | Notifications e-mail |

### 11.3 Coûts & plans
- **Vercel :** le plan gratuit Hobby est réservé à l'usage personnel non commercial ; un site client/startup doit passer sur un plan payant (Pro). Alternatives : Netlify, Render, ou un VPS avec Coolify. **À décider avec le client et à intégrer dans le devis.**
- **Neon :** le plan gratuit (1 Go de stockage et 100 heures de calcul par projet et par mois, mise en veille après 5 min) suffit largement pour la V1. Passer au plan Launch (paiement à l'usage) si le trafic grimpe.
- **Google Maps Embed :** gratuit, mais un compte de facturation Google Cloud est requis pour créer la clé.
- **Domaine :** un `.com` s'achète en quelques minutes ; un `.dz` demande des démarches qui peuvent dépasser le délai → prévoir le `.com` pour le 5/12 si le `.dz` n'est pas déjà en cours.
- **Propriété des comptes :** idéalement Neon, Vercel, Google Cloud et le domaine au nom du client (ou transfert à la livraison).

---

## 12. Risques & plan B

### 12.1 Risques

| Risque | Probabilité | Impact | Parade |
| :--- | :---: | :---: | :--- |
| Contenu client (FR/AR, photos) en retard | Haute | Haut | Demande dès J0 avec date limite J5 ; fallback FR ; seed réaliste pour la démo ; import par tableur |
| Écrans Stitch incomplets (fiches détail, admin) | Moyenne | Moyen | Dériver des écrans existants ; admin en shadcn/ui |
| Retard de planning | Moyenne | Haut | Plan B ci-dessous, décision chaque soir |
| Bugs RTL découverts tard | Moyenne | Moyen | Règles dans CLAUDE.md dès J1, audit à chaque phase |
| Claude Code utilise des API Next 14/15 | Moyenne | Moyen | Règles Next 16 dans CLAUDE.md + docs embarquées dans `node_modules/next/dist/docs/` |
| Spam sur les formulaires | Moyenne | Faible | Honeypot + rate-limit ; Cloudflare Turnstile en V1.1 si besoin |
| Choix d'hébergement non tranché | Moyenne | Moyen | Décider avant J9 (§14) |

### 12.2 Priorisation (MoSCoW)

- **Must (non négociable le 5/12) :** 5 pages publiques + fiches détail, FR/AR + RTL, cartes, 4 formulaires → base, auth admin, CRUD ×3, gestion des demandes et messages, responsive.
- **Should :** filtres complets, suggestions à proximité, galerie, paramètres du site, SEO de base, upload avec compression.
- **Could :** notifications e-mail, export CSV, JSON-LD, tests Playwright, rafraîchissement auto du dashboard, import par tableur.
- **Won't (V2, comme prévu) :** paiement, réservation instantanée, app mobile, comptes partenaires, avis, commissions.

**Coupes à faire si plus d'une journée de retard au soir du J6 :**
1. Galerie → image de couverture seule.
2. Associations manuelles hébergements ↔ évènements → « même zone » automatique.
3. Paramètres de l'accueil → textes dans `messages/*.json` (seules les coordonnées restent éditables).
4. Filtre « période » et filtre « proche de l'évènement » → reportés en V1.1.

---

## 13. Livraison & passation

### 13.1 Liste de contenu à demander au client (à envoyer dès J0)
- Logo (SVG ou PNG haute définition) et éventuelles couleurs imposées.
- Slogan et textes de l'accueil (FR + AR).
- Pour chaque évènement / activité / hébergement : titre, description, lieu précis (ou lien Google Maps), dates, prix, contact, 3 à 6 photos (droits d'utilisation confirmés).
- Coordonnées officielles, liens des réseaux sociaux, numéro WhatsApp.
- Adresse e-mail qui recevra les notifications.
- Un modèle de tableur (une feuille par type) facilite la collecte et permet l'import automatique (prompt 7.1).

### 13.2 Livrables du 5 décembre
- [ ] Site en production (URL + domaine).
- [ ] Accès admin du client (identifiants transmis séparément, changement de mot de passe à la première connexion recommandé).
- [ ] `docs/GUIDE_ADMIN.md` (avec captures) exporté en PDF.
- [ ] Formation de 30 à 45 minutes (visio ou présentiel) sur le back-office.
- [ ] Accès ou transfert : GitHub, Neon, Vercel, Google Cloud, domaine.
- [ ] Note de version : fonctionnalités livrées, limites connues, idées V2.
- [ ] Période de correction après livraison (ex. 2 semaines) à préciser dans l'accord avec le client.

---

## 14. Décisions à trancher

| # | Question | Ma recommandation par défaut |
| :-- | :--- | :--- |
| 1 | Quels écrans Stitch existent exactement (fiches détail ? admin ? versions mobile ?) | Me lister les écrans ; je complète le tableau 5.2 |
| 2 | Export Stitch dans le repo ou Stitch MCP ? | Export dans `design/stitch/` (+ MCP en bonus) |
| 3 | Hébergement : Vercel Pro payé par le client, ou autre ? | Vercel Pro (le plus simple avec Next.js) |
| 4 | Stockage des images : Vercel Blob, Neon Object Storage, Cloudinary ? | Vercel Blob (si Vercel) ; Neon Object Storage si tu veux tout chez Neon (vérifier l'accès public et le CDN) |
| 5 | Auth : maison (jose + bcrypt) ou Better Auth ? | Maison (un seul rôle, colle au schéma) |
| 6 | Un seul compte admin ou plusieurs ? | Plusieurs possibles (table prévue), sans gestion de rôles |
| 7 | E-mail obligatoire dans les formulaires de demande ? | Téléphone obligatoire, e-mail facultatif (sauf Contact) |
| 8 | Notifications admin : e-mail (Resend), WhatsApp seul, ou rien ? | Lien WhatsApp dans l'admin + e-mail si le domaine est prêt |
| 9 | Zone géographique ciblée (wilayas) pour le seed et les filtres ? | À préciser |
| 10 | Domaine : `.com`, `.dz`, autre ? | `.com` pour tenir le délai |
| 11 | URLs FR sans préfixe (`/evenements`) ou toujours préfixées (`/fr/evenements`) ? | Sans préfixe, conforme au plan initial |

---

## 15. Sources

- Next.js — blog et versions : https://nextjs.org/blog
- Next.js 16 et MCP (next-devtools-mcp) : https://nextjs.org/docs/app/guides/mcp
- next-intl — proxy / middleware : https://next-intl.dev/docs/routing/middleware
- Neon — Drizzle : https://neon.com/docs/guides/drizzle
- Neon — migrations Drizzle : https://neon.com/docs/guides/drizzle-migrations
- Neon — Claude Code : https://neon.com/docs/ai/agent-setup/claude-code
- Neon — plan gratuit : https://neon.com/faqs/free-plan-limits-and-quotas
- Neon — Object Storage : https://neon.com/docs/storage/overview
- Claude Code — MCP : https://code.claude.com/docs/en/mcp
- Claude Code — Skills : https://code.claude.com/docs/en/skills
- Claude Code — Settings & permissions : https://code.claude.com/docs/en/settings
- Google Maps Embed API : https://developers.google.com/maps/documentation/embed
- Vercel — Fair Use (plan Hobby) : https://vercel.com/docs/platform/fair-use-policy
- Google Stitch — MCP : https://stitch.withgoogle.com/docs/mcp/setup
