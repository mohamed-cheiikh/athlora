# Athlora — Rapport d'avancement

**Projet :** Plateforme bilingue FR/AR — Tourisme sportif Mostaganem
**Stack :** Next.js 16.4.6 · Neon Postgres · Drizzle ORM · next-intl v4 · Tailwind v4
**Dernière mise à jour :** 25/11/2026

---

## Statut global

| Phase | Nom | Statut | % |
|-------|-----|--------|---|
| **0** | Préparation | ✅ Complété (sauf actions manuelles) | 80% |
| 1 | Fondations (Next.js + FR/AR + Header/Footer) | ⏳ À faire | 0% |
| 2 | Base de données (schéma + seed + requêtes) | ⏳ À faire | 0% |
| 3a | Pages publiques — Accueil + Événements | ⏳ À faire | 0% |
| 3b | Pages publiques — Activités + Hébergements + Contact | ⏳ À faire | 0% |
| 4 | Formulaires (4 formulaires → DB + anti-spam) | ⏳ À faire | 0% |
| 5a | Admin — Auth + Dashboard + CRUD Événements | ⏳ À faire | 0% |
| 5b | Admin — CRUD Activités/Hébergements + Demandes + Paramètres | ⏳ À faire | 0% |
| 6 | QA — Sécurité + RTL + SEO + Tests | ⏳ À faire | 0% |
| 7 | Production — Déploiement + Contenu réel | ⏳ À faire | 0% |
| Livraison | Guide admin + Formation + Passation | ⏳ À faire | 0% |

---

## Phase 0 — Préparation ✅ (80%)

### ✅ Fait
- **Environnement :** Node 26.7.0, npm 11.6, git 2.51 — tout opérationnel
- **Écrans Stitch :** 4 screens avec code.html (Accueil, Événements, Activités, Hébergements) + tokens DESIGN.md
- **CLAUDE.md** : toutes les règles Next.js 16 + RTL + sécurité + méthode
- **.claude/settings.json** : permissions (allow/ask/deny)
- **3 skills** : `stitch-convert`, `admin-crud`, `i18n-rtl-audit`
- **2 agents** : `security-reviewer`, `rtl-reviewer`
- **docs/PLAN.md** copié (référence complète)
- **docs/LOG.md** + **docs/RAPPORT.md** créés et actifs
- **.env.example** avec toutes les variables documentées
- **Next.js 16.4.6** initialisé (React 19, Tailwind v4, TypeScript strict, Turbopack, App Router)
- **package.json** : nom `athlora`, scripts complets (typecheck, db:*, admin:create)
- **Git** : repo initialisé, 2 commits propres

### ⏳ Actions manuelles restantes
- [ ] **GitHub** — créer repo privé `athlora`, `git remote add origin <url>`, `git push -u origin master`
- [ ] **Neon** — projet `athlora` région Frankfurt, branche `dev`, copier les 4 URLs dans `.env.local`
- [ ] **Vercel** — décider plan Pro (obligatoire pour site client commercial)
- [ ] **Google Cloud** — activer Maps Embed API, créer clé API restreinte
- [ ] **MCP Neon** — `npx neon@latest init` dans le projet
- [ ] **MCP next-devtools** — `claude mcp add next-devtools -- npx -y next-devtools-mcp@latest`
- [ ] **Liste contenu client** — envoyer §13.1 du plan avec deadline (J+5 depuis maintenant)

### Écrans Stitch — Inventaire
| Écran | Fichier | Statut |
|-------|---------|--------|
| Accueil | `athlora_plateforme_sport_aventure_mostaganem/code.html` | ✅ Disponible |
| Événements (catalogue) | `athlora_v_nements_comp_titions_mostaganem/code.html` | ✅ Disponible |
| Activités (catalogue) | `athlora_activit_s_outdoor_mostaganem/code.html` | ✅ Disponible |
| Hébergements (catalogue) | `athlora_h_bergements_s_jours_sportifs_mostaganem/code.html` | ✅ Disponible |
| Tokens design | `athletic_velocity_exploration/DESIGN.md` | ✅ Disponible |
| Détail événement | — | ❌ Manquant → à dériver |
| Détail activité | — | ❌ Manquant → à dériver |
| Détail hébergement | — | ❌ Manquant → à dériver |
| Contact | — | ❌ Manquant → à créer |
| Admin | — | ❌ Manquant → shadcn/ui |

---

## Décisions confirmées

| # | Décision | Valeur |
|---|----------|--------|
| Zone géographique | Mostaganem (détecté dans les noms des écrans Stitch) | ✅ |
| Auth | Maison (jose + bcryptjs) | ✅ |
| Stockage images | Vercel Blob | ✅ |
| ORM | Drizzle + neon-http driver | ✅ |
| Formulaires publics | Téléphone obligatoire, email facultatif (sauf Contact) | ✅ |
| URLs FR | Sans préfixe (`/evenements`) — AR avec préfixe (`/ar/evenements`) | ✅ |
| Descriptions | Texte brut (`whitespace-pre-line`), pas d'éditeur riche en V1 | ✅ |

## Décisions en suspens

| # | Question | Recommandation |
|---|----------|---------------|
| 1 | Vercel : Hobby ou Pro ? | **Pro obligatoire** (site client commercial) |
| 2 | Domaine : `.com` ou `.dz` ? | `.com` (disponible immédiatement) |
| 3 | Notifications admin : WhatsApp seul ou + Resend ? | WhatsApp dans l'admin + Resend si temps le permet |

---

## Problèmes ouverts

_Aucun pour l'instant._

---

## Prochaine étape

**Phase 1 — Fondations** : dès que GitHub + Neon + `.env.local` sont prêts.

Actions Phase 1 :
1. Installer toutes les dépendances
2. Configurer next-intl + proxy.ts
3. Créer l'arborescence complète
4. Implémenter les layouts (avec lang/dir RTL)
5. Header + Footer depuis Stitch
6. Déployer sur Vercel (preview)
