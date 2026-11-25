# Athlora — Fichier de passation entre sessions Claude

> **USAGE :** Colle ce fichier en entier dans la première message d'une nouvelle session Claude.
> Il contient tout le contexte pour reprendre le travail exactement où il s'est arrêté.
> Mettre à jour ce fichier dès que l'avancement change (avant 5 % d'usage restant).

---

## 1. Description du projet

**Athlora** — Plateforme bilingue **FR/AR** de tourisme sportif pour l'Algérie.
V1 : 3 villes — Alger, Oran, Mostaganem. L'admin peut ajouter d'autres villes ensuite.
Contexte : PFE startup. Livraison cible : début décembre 2026.

**Répertoire local :** `C:\Users\cheik\Desktop\athlora`
**Répertoire Next.js :** `C:\Users\cheik\Desktop\athlora-next` (non utilisé, le vrai projet est dans `athlora`)

---

## 2. Stack technique

| Couche | Technologie | Notes |
|--------|-------------|-------|
| Framework | Next.js 16.4.6 — App Router, TS strict, Turbopack | |
| CSS | Tailwind CSS v4 — tokens `@theme` | Pas de `ml-/mr-/pl-/pr-` — classes logiques uniquement |
| UI Admin | shadcn/ui + lucide-react | |
| DB | Neon Postgres + Drizzle ORM | driver neon-http, casing snake_case |
| Auth | Maison : bcryptjs (coût 12) + jose HS256 7d | cookie `athlora_session` httpOnly |
| i18n | next-intl v4 — `localePrefix: "as-needed"` | FR = `/evenements` AR = `/ar/evenements` |
| Images | Vercel Blob (`@vercel/blob`) | |
| Formulaires | Zod + Server Actions + `useActionState` React 19 | |
| Anti-spam | Honeypot `_hp: z.literal("")` + rate limit 3 hits/10 min | Table `rate_limits` en DB |
| Maps | Lien direct Google Maps — pas d'embed, pas d'API key | `https://www.google.com/maps/search/?api=1&query=…` |
| Tests | Playwright (à compléter — voir §6) | |

---

## 3. État d'avancement — 25/11/2026

| Phase | Nom | Statut |
|-------|-----|--------|
| **0** | Préparation | ✅ 100% |
| **1** | Fondations (Next.js + FR/AR + Header/Footer) | ✅ 100% |
| **2** | Base de données (schéma + migration + seed + requêtes) | ✅ 100% |
| **3** | Pages publiques (toutes les pages + composants) | ✅ 100% |
| **4** | Formulaires (4 formulaires → DB + anti-spam) | ✅ 100% |
| **5a** | Admin — Auth + Dashboard + CRUD Événements | ✅ 100% |
| **5b** | Admin — CRUD Activités/Hébergements + Demandes + Paramètres | ✅ 100% |
| **6** | QA — Sécurité + RTL + SEO + Tests | 🔄 80% (voir §6) |
| **7** | Production — Déploiement Vercel + Neon main | ⏳ 0% |
| Livraison | Guide admin + Formation + Passation | ⏳ 0% |

---

## 4. Fichiers clés — carte mentale

```
src/
├── proxy.ts                          ← middleware Next.js (next-intl + auth admin)
├── db/
│   └── schema.ts                     ← 10 tables Drizzle + types exportés
├── i18n/
│   ├── routing.ts                    ← locales: ["fr","ar"], defaultLocale:"fr", localePrefix:"as-needed"
│   ├── navigation.ts                 ← Link, useRouter, usePathname localisés
│   └── request.ts                    ← getRequestConfig pour next-intl
├── lib/
│   ├── auth/
│   │   ├── session.ts                ← createSessionToken / verifySessionToken (jose)
│   │   └── require-admin.ts          ← guard serveur (throws redirect)
│   ├── queries/                      ← Lectures DB (import "server-only")
│   │   ├── evenements.ts
│   │   ├── activites.ts
│   │   ├── hebergements.ts
│   │   ├── parametres.ts             ← getParametre, getAllParametres, upsertParametre
│   │   ├── zones.ts                  ← ZONES_V1 = ["Alger","Oran","Mostaganem"]
│   │   └── admin/
│   │       ├── dashboard.ts
│   │       ├── evenements.ts
│   │       ├── activites.ts
│   │       ├── hebergements.ts
│   │       ├── demandes.ts
│   │       └── messages.ts
│   ├── actions/                      ← Écritures DB (Server Actions)
│   │   ├── public/
│   │   │   ├── register-event.ts
│   │   │   ├── book-activity.ts
│   │   │   ├── book-stay.ts
│   │   │   └── send-message.ts
│   │   └── admin/
│   │       ├── login.ts
│   │       ├── logout.ts
│   │       ├── upload-image.ts
│   │       ├── evenements.ts
│   │       ├── activites.ts
│   │       ├── hebergements.ts
│   │       ├── demandes.ts
│   │       ├── messages.ts
│   │       └── settings.ts
│   ├── rate-limit.ts                 ← checkRateLimit(key) → boolean
│   └── validation/
│       └── forms.ts                  ← Zod schemas: registerEvent, bookActivity, bookStay, contact
├── components/
│   ├── layout/
│   │   ├── Header.tsx                ← "use client", nav bilingue, mobile menu, sélecteur langue
│   │   └── Footer.tsx                ← liens, contact, réseaux sociaux
│   ├── cards/
│   │   ├── EventCard.tsx             ← Server Component
│   │   ├── ActivityCard.tsx          ← Server Component
│   │   └── StayCard.tsx              ← Server Component
│   ├── filters/
│   │   ├── EventFilters.tsx          ← "use client", useSearchParams next-intl
│   │   ├── ActivityFilters.tsx       ← "use client"
│   │   └── StayFilters.tsx           ← "use client"
│   ├── forms/
│   │   ├── EventRegistrationForm.tsx ← "use client", useActionState
│   │   ├── BookingActivityForm.tsx   ← "use client"
│   │   ├── BookingStayForm.tsx       ← "use client"
│   │   └── ContactForm.tsx           ← "use client"
│   └── admin/
│       ├── EvenementForm.tsx         ← "use client", encType multipart
│       ├── ActiviteForm.tsx          ← "use client"
│       ├── HebergementForm.tsx       ← "use client", checkboxes commodités
│       └── SettingsForms.tsx         ← "use client", 3 sections (accueil/contact/réseaux)
└── app/
    ├── page.tsx                      ← redirect("/fr")
    ├── layout.tsx                    ← root layout
    ├── robots.ts                     ← /robots.txt
    ├── sitemap.ts                    ← /sitemap.xml dynamique (FR+AR)
    ├── [locale]/
    │   ├── layout.tsx                ← lang/dir dynamiques, Header+Footer
    │   ├── page.tsx                  ← Accueil
    │   ├── evenements/page.tsx + [slug]/page.tsx
    │   ├── activites/page.tsx + [slug]/page.tsx
    │   ├── hebergements/page.tsx + [slug]/page.tsx
    │   └── contact/page.tsx
    └── admin/
        ├── login/page.tsx
        └── (protected)/
            ├── layout.tsx            ← sidebar + requireAdmin()
            ├── page.tsx              ← dashboard stats
            ├── evenements/ (list + new + [id]/edit)
            ├── activites/  (list + new + [id]/edit)
            ├── hebergements/ (list + new + [id]/edit)
            ├── demandes/page.tsx
            ├── messages/page.tsx
            └── settings/page.tsx

e2e/                                  ← tests Playwright (à créer — voir §6)
playwright.config.ts                  ← config Playwright installée

scripts/
├── seed.ts                           ← npm run db:seed
└── create-admin.ts                   ← npm run admin:create <nom> <email> <mdp>
```

---

## 5. Ce qui a été fait en Phase 6 (en cours)

### ✅ RTL / i18n audit (100%)
- Toutes les clés FR/AR identiques dans `messages/fr.json` et `messages/ar.json`
- `setRequestLocale()` présent dans les 9 pages/layouts `[locale]`
- `<bdi dir="ltr">` sur tous les numéros, e-mails, dates
- Corrigé : `file:mr-4` → `file:me-4` dans EvenementForm, ActiviteForm, HebergementForm
- Corrigé : `text-right` → `text-end` dans demandes/page.tsx
- Corrigé : `src/app/page.tsx` (template Next.js boilerplate) → `redirect("/fr")`

### ✅ Sécurité (100%)
- En-têtes HTTP dans `next.config.ts` : `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`
- `requireAdmin()` dans layout protégé **et** dans chaque Server Action admin
- Pas de `dangerouslySetInnerHTML` sur contenu utilisateur (JSON-LD échappé avec `<`)
- Cookie `httpOnly`, `sameSite: lax`, expiration 7 jours

### ✅ SEO (100%)
- `src/app/robots.ts` → `/robots.txt` (interdit `/admin`, `/api`)
- `src/app/sitemap.ts` → `/sitemap.xml` dynamique (pages statiques + toutes fiches publiées × 2 langues)
- `generateMetadata` avec `alternates.languages` (hreflang fr/ar/x-default) sur toutes les pages
- OG image sur les fiches détail (image de couverture si dispo)
- JSON-LD `Event` sur fiches événements, `LodgingBusiness` sur fiches hébergements

### ⏳ Tests Playwright (0% — PROCHAINE ÉTAPE)
Playwright installé (`@playwright/test` + Chromium), `playwright.config.ts` créé.
**Reste à créer : `e2e/smoke.spec.ts`** avec 5 parcours :
1. Accueil FR et AR — titre hero visible, liens nav fonctionnels
2. Filtre événements — sélectionner une zone, vérifier que les cartes se filtrent
3. Envoi d'une demande hébergement — remplir le formulaire, vérifier le message succès
4. Login admin + changement statut d'une demande — login → demandes → cliquer "Confirmé"
5. Création puis suppression d'un événement admin

**Commande pour lancer (dev server doit tourner) :**
```bash
npm run dev  # dans un terminal séparé
npx playwright test
```

---

## 6. Prochaines étapes dans l'ordre

### Étape immédiate : finir Phase 6 — Tests Playwright
Créer `e2e/smoke.spec.ts`. Le dev server tourne sur `http://localhost:3000`.
Il faut un compte admin pour les tests 4 et 5 — créer d'abord avec :
```bash
npm run admin:create "Test Admin" admin@test.dz AdminTest2026!
```

### Phase 7 — Production (après Phase 6 verte)
1. `npm install next@latest` — mettre à jour Next.js
2. Neon `main` : `DATABASE_URL_UNPOOLED` de la branche main → `npm run db:migrate`
3. Vercel : variables d'environnement Production, région `fra1`, domaine + HTTPS
4. `npm run admin:create` sur prod pour le compte client
5. Saisie du contenu réel via l'admin

### Variables d'environnement requises (`.env.local`)
```
DATABASE_URL=         ← Neon pooled (branche dev)
DATABASE_URL_UNPOOLED=← Neon direct (branche dev)
SESSION_SECRET=       ← 32+ chars aléatoires
BLOB_READ_WRITE_TOKEN=← Vercel Blob
NEXT_PUBLIC_SITE_URL= ← https://athlora.com (ou URL de preview)
```

---

## 7. Commandes utiles

```bash
npm run dev          # dev server http://localhost:3000
npm run typecheck    # 0 erreur attendu
npm run build        # vérification complète
npm run db:seed      # reseed (efface tout d'abord)
npm run db:studio    # Drizzle Studio
npm run admin:create "Nom" email@ex.com MotDePasse123!

npx playwright test  # smoke tests (dev server requis)
git log --oneline    # 5 commits: 4a3e34b → 6274323 + non commités Phase 6
```

---

## 8. Règles importantes à ne pas oublier

- **Classes Tailwind :** `ms-/me-/ps-/pe-/text-start/text-end` uniquement — jamais `ml-/mr-/pl-/pr-/text-left/text-right`
- **Navigation public :** `import { Link, useRouter } from "@/i18n/navigation"` — jamais `next/navigation` dans `[locale]`
- **Server Actions admin :** toujours commencer par `await requireAdmin()`
- **Mutations publiques :** `revalidatePath('/', 'layout')` après chaque changement admin
- **params/searchParams :** toujours `await` (Next.js 16 async)
- **Pas de `dangerouslySetInnerHTML`** sur contenu utilisateur (JSON-LD: OK car échappé)
- **Migrations :** `npm run db:generate` puis `npm run db:migrate` — jamais `drizzle-kit push`
- **`.env.local` :** ne jamais lire ni commiter — utiliser `.env.example` pour connaître les variables

---

## 9. Commits git actuels

```
6274323  feat(admin): complete Phase 5 — full admin dashboard (CRUD + settings)
87162c8  feat: phase 4 — forms with Server Actions, Zod, rate-limit, honeypot
fccece5  feat: phase 2+3 — DB layer, seed, query layer, all public pages
a01a99c  feat: phase 1 — design system Tailwind v4, Header FR/AR RTL, Footer, build vert
790d8cf  feat: phase 1 — next-intl, layouts FR/AR RTL, messages complets, auth squelette
23390e4  docs: mise à jour LOG et RAPPORT — phase 0 terminée
bdf159f  chore: phase 0 — Next.js 16.4.6 + Tailwind v4, scripts db/admin
4a3e34b  chore: phase 0 — CLAUDE.md, settings, skills, agents, LOG, RAPPORT, PLAN
```
*Phase 6 non encore commitée — changements en cours dans le working tree.*

---

## 10. Prompt de reprise pour nouvelle session

Colle ce bloc en début de conversation pour reprendre :

```
Je travaille sur le projet Athlora (C:\Users\cheik\Desktop\athlora).
Voici le fichier de passation complet : [coller le contenu de ce fichier]

Reprends le travail à l'étape suivante : Phase 6 — Tests Playwright.
Crée e2e/smoke.spec.ts avec les 5 parcours décrits en §5.
Le dev server tourne sur localhost:3000.
```
