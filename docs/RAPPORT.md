# Athlora — Rapport d'avancement

**Projet :** Plateforme bilingue FR/AR — Tourisme sportif Algérie (Alger · Oran · Mostaganem)
**Stack :** Next.js 16.4.6 · Neon Postgres · Drizzle ORM · next-intl v4 · Tailwind v4
**Dernière mise à jour :** 25/11/2026

---

## Statut global

| Phase | Nom | Statut | % |
|-------|-----|--------|---|
| **0** | Préparation | ✅ Complété | 100% |
| **1** | Fondations (Next.js + FR/AR + Header/Footer) | ✅ Complété | 100% |
| **2** | Base de données (schéma + migration + seed + requêtes) | ✅ Complété | 100% |
| **3** | Pages publiques (toutes les pages + composants) | ✅ Complété | 100% |
| **4** | Formulaires (4 formulaires → DB + anti-spam) | ✅ Complété | 100% |
| **5a** | Admin — Auth + Dashboard + CRUD Événements | ✅ Complété | 100% |
| **5b** | Admin — CRUD Activités/Hébergements + Demandes + Paramètres | ✅ Complété | 100% |
| **6** | QA — Sécurité + RTL + SEO + Tests | 🔄 En cours | 80% |
| **7** | Production — Déploiement Vercel + Neon main | ⏳ À faire | 0% |
| **Livraison** | Guide admin + Formation + Passation | ⏳ À faire | 0% |

---

## Phase 2 — Base de données ✅

- **Schéma Drizzle** : 10 tables + 8 enums (voir `src/db/schema.ts`)
- **Migration** : `drizzle/0000_wild_inhumans.sql` appliquée sur Neon dev branch ✅
- **Seed** : 6 événements + 8 activités + 6 hébergements + associations + paramètres + 5 demandes + 3 messages
- **Layer requêtes public** : evenements, activites, hebergements, parametres, zones
- **Layer requêtes admin** : dashboard, evenements, activites, hebergements, demandes, messages
- Build sans erreurs TypeScript ✅

---

## Phase 3 — Pages publiques ✅

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | redirect → `/fr` |
| `/[locale]` | SSG | Accueil : hero + événements à la une + activités sport/tourisme + hébergements + valeurs |
| `/[locale]/evenements` | Dynamic | Catalogue avec filtres URL (zone · sport · période) |
| `/[locale]/evenements/[slug]` | Dynamic | Détail + hébergements proches + Maps link + JSON-LD Event |
| `/[locale]/activites` | Dynamic | Catalogue avec onglets sport/tourisme |
| `/[locale]/activites/[slug]` | Dynamic | Détail + organisateur + hébergements proches |
| `/[locale]/hebergements` | Dynamic | Catalogue avec filtres |
| `/[locale]/hebergements/[slug]` | Dynamic | Détail + commodités + Maps link + JSON-LD LodgingBusiness |
| `/[locale]/contact` | SSG | Infos contact + formulaire |

---

## Phase 4 — Formulaires ✅

| Formulaire | Action | Anti-spam |
|-----------|--------|-----------|
| `EventRegistrationForm` | `registerEventAction` | Honeypot + rate limit |
| `BookingActivityForm` | `bookActivityAction` | Honeypot + rate limit |
| `BookingStayForm` | `bookStayAction` | Honeypot + rate limit |
| `ContactForm` | `sendMessageAction` | Honeypot + rate limit |

- Zod validation côté serveur sur 100% des Server Actions ✅
- Rate limit : 3 requêtes / 10 min par IP (table `rate_limits`) ✅
- Honeypot : champ `_hp: z.literal("")` invisible ✅
- Insert dans `demandes_reservations` ou `messages_contact` ✅

---

## Phase 5 — Admin ✅

### Routes admin créées

| Route | Description |
|-------|-------------|
| `/admin/login` | Login page (JWT httpOnly cookie) |
| `/admin` | Dashboard : stats (5 compteurs) + demandes récentes |
| `/admin/evenements` | Liste + publish/unpublish + delete |
| `/admin/evenements/new` | Formulaire création bilingue FR/AR + upload image |
| `/admin/evenements/[id]/edit` | Formulaire modification |
| `/admin/activites` | Liste + publish/unpublish + delete |
| `/admin/activites/new` | Formulaire (catégorie, sous-catégorie, contact organisateur) |
| `/admin/activites/[id]/edit` | Formulaire modification |
| `/admin/hebergements` | Liste + publish/unpublish + delete |
| `/admin/hebergements/new` | Formulaire (type, commodités checkboxes, contact) |
| `/admin/hebergements/[id]/edit` | Formulaire modification |
| `/admin/demandes` | Cards + filtre statut + 3 boutons mise à jour inline |
| `/admin/messages` | Messages + mark-lu / mark-all-lu |
| `/admin/settings` | Textes hero + infos contact + réseaux sociaux |

---

## Phase 6 — QA (en cours) 🔄

### ✅ RTL / i18n audit
- Clés FR/AR identiques (0 manquant)
- `setRequestLocale()` présent dans les 9 pages `[locale]`
- `<bdi dir="ltr">` sur tous numéros/e-mails/dates
- Corrections : `file:mr-4` → `file:me-4` (3 formulaires admin), `text-right` → `text-end`
- Corrections : `src/app/page.tsx` nettoyé (boilerplate Next.js → redirect)

### ✅ Sécurité
- En-têtes HTTP : `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`
- `requireAdmin()` dans layout protégé + chaque Server Action admin
- Pas de `dangerouslySetInnerHTML` sur contenu utilisateur

### ✅ SEO
- `/robots.txt` (interdit `/admin`, `/api`)
- `/sitemap.xml` dynamique (pages statiques + fiches publiées × 2 langues)
- Hreflang `fr/ar/x-default` sur toutes les pages
- OG image sur les fiches détail
- JSON-LD `Event` sur fiches événements, `LodgingBusiness` sur hébergements

### ⏳ Tests Playwright
- Playwright installé + `playwright.config.ts` créé
- **Reste à créer : `e2e/smoke.spec.ts`** (5 parcours smoke)

---

## Décisions confirmées

| # | Décision | Valeur |
|---|----------|--------|
| Zone géographique | Algérie entière — V1 couvre : Alger, Oran, Mostaganem | ✅ |
| Auth | Maison (jose + bcryptjs) | ✅ |
| Stockage images | Vercel Blob | ✅ |
| ORM | Drizzle + neon-http driver | ✅ |
| Formulaires publics | Téléphone obligatoire, email facultatif (sauf Contact) | ✅ |
| URLs FR | Sans préfixe (`/evenements`) — AR avec préfixe (`/ar/evenements`) | ✅ |
| Google Maps | Lien direct ouverture Google Maps, pas d'API ni d'embed | ✅ |
| Filtrage | Par "ville" (zone) : Alger, Oran, Mostaganem | ✅ |
