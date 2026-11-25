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
| 4 | Formulaires (4 formulaires → DB + anti-spam) | ⏳ À faire | 0% |
| 5a | Admin — Auth + Dashboard + CRUD Événements | ⏳ À faire | 0% |
| 5b | Admin — CRUD Activités/Hébergements + Demandes + Paramètres | ⏳ À faire | 0% |
| 6 | QA — Sécurité + RTL + SEO + Tests | ⏳ À faire | 0% |
| 7 | Production — Déploiement + Contenu réel | ⏳ À faire | 0% |
| Livraison | Guide admin + Formation + Passation | ⏳ À faire | 0% |

---

## Phase 2 — Base de données ✅

- **Schéma Drizzle** : 10 tables (usersAdmin, evenements, activites, hebergements, demandesReservations, messagesContact, hebergementsEvenements, hebergementsActivites, parametresSite, rateLimits) + 8 enums
- **Migration** : `drizzle/0000_wild_inhumans.sql` appliquée sur Neon dev branch ✅
- **Seed** : 6 événements + 8 activités + 6 hébergements + associations + paramètres + 5 demandes + 3 messages — toutes 3 villes
- **Layer requêtes public** : `evenements.ts`, `activites.ts`, `hebergements.ts`, `parametres.ts`, `zones.ts`
- **Layer requêtes admin** : `admin/dashboard.ts`, `admin/evenements.ts`, `admin/activites.ts`, `admin/hebergements.ts`, `admin/demandes.ts`, `admin/messages.ts`
- **Script admin** : `scripts/create-admin.ts` (usage : `npm run admin:create <nom> <email> <mdp>`)
- Build sans erreurs TypeScript ✅

---

## Phase 3 — Pages publiques ✅

### Composants créés
| Composant | Description |
|-----------|-------------|
| `src/components/cards/EventCard.tsx` | Carte événement (gradient sport, badges, date, lieu, prix) |
| `src/components/cards/ActivityCard.tsx` | Carte activité (gradient catégorie, durée, prix) |
| `src/components/cards/StayCard.tsx` | Carte hébergement (gradient type, commodités, prix/nuit) |
| `src/components/filters/EventFilters.tsx` | Filtre client (zone, sport, période) |
| `src/components/filters/ActivityFilters.tsx` | Filtre client (zone, catégorie sport/tourisme) |
| `src/components/filters/StayFilters.tsx` | Filtre client (zone, type d'hébergement) |

### Pages créées
| Route | Type | Description |
|-------|------|-------------|
| `/` | SSG | Accueil : hero + événements à la une + activités sport/tourisme + hébergements + valeurs |
| `/evenements` | Dynamic | Catalogue événements avec filtres URL |
| `/evenements/[slug]` | Dynamic | Détail événement + hébergements proches + lien Google Maps |
| `/activites` | Dynamic | Catalogue activités avec onglets sport/tourisme |
| `/activites/[slug]` | Dynamic | Détail activité + organisateur + hébergements proches |
| `/hebergements` | Dynamic | Catalogue hébergements avec filtres |
| `/hebergements/[slug]` | Dynamic | Détail hébergement + commodités + lien Google Maps |
| `/contact` | SSG | Infos contact + formulaire (UI désactivé — Phase 4) |

### Validations
- `npm run typecheck` : 0 erreur ✅
- `npm run build` : 14 routes compilées, 0 warning ✅
- Toutes pages HTTP 200 (FR + AR) ✅
- Slugs DB vérifiés (tous `publie=true`) ✅
- RTL : classes logiques Tailwind utilisées (gap, px, py — pas de ml/mr/pl/pr) ✅
- SEO : `generateMetadata` sur chaque page ✅
- Google Maps : lien direct `https://www.google.com/maps/search/?api=1&query=…` (pas d'embed) ✅

---

## Phase 0 — Préparation ✅

### Actions manuelles restantes
- [ ] **GitHub** — `git push -u origin master` (réseau requis)
- [ ] **Vercel** — importer le repo quand prêt pour la production

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

---

## Prochaine étape : Phase 4 — Formulaires

4 formulaires avec Server Actions :
1. **EventRegistrationForm** — inscription événement (`/evenements/[slug]#inscription`)
2. **BookingActivityForm** — réservation activité (`/activites/[slug]#reservation`)
3. **BookingStayForm** — réservation hébergement (`/hebergements/[slug]#reservation`)
4. **ContactForm** — formulaire contact (`/contact`)

Chaque formulaire : Zod validation · Honeypot anti-spam · Rate limiting (table `rate_limits`) · Insert DB
