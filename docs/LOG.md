# Athlora — Journal de bord

> Chaque action est enregistrée ici dans l'ordre chronologique. Mis à jour automatiquement à chaque avancement.

---

## PHASE 0 — Préparation ✅

### [25/11/2026 — Session 1]

#### ✅ Environnement vérifié
- Node.js v26.7.0
- npm 11.6.2
- git 2.51.2

#### ✅ Écrans Stitch détectés dans `stitch_athlora_sports_tourism_platform/`
| Dossier | Contenu | Correspond à |
|---------|---------|--------------|
| `athletic_velocity_exploration` | DESIGN.md uniquement | Tokens design Tailwind |
| `athlora_activit_s_outdoor_mostaganem` | code.html + screen.png | Page Activités |
| `athlora_h_bergements_s_jours_sportifs_mostaganem` | code.html + screen.png | Page Hébergements |
| `athlora_plateforme_sport_aventure_mostaganem` | code.html + screen.png | Page Accueil |
| `athlora_v_nements_comp_titions_mostaganem` | code.html + screen.png | Page Événements |

**Écrans manquants** (à dériver ou créer manuellement) :
- Détail événement (dériver de l'écran Événements)
- Détail activité (dériver de l'écran Activités)
- Détail hébergement (dériver de l'écran Hébergements)
- Page Contact
- Interface Admin (shadcn/ui)

#### ✅ Structure dossiers créée
- `docs/` — documentation projet
- `.claude/skills/stitch-convert/`
- `.claude/skills/admin-crud/`
- `.claude/skills/i18n-rtl-audit/`
- `.claude/agents/`

#### ✅ Fichiers de configuration créés
- `CLAUDE.md` — instructions permanentes pour Claude Code
- `.claude/settings.json` — permissions (allow/ask/deny)
- `.claude/skills/stitch-convert/SKILL.md`
- `.claude/skills/admin-crud/SKILL.md`
- `.claude/skills/i18n-rtl-audit/SKILL.md`
- `.claude/agents/security-reviewer.md`
- `.claude/agents/rtl-reviewer.md`
- `docs/LOG.md` (ce fichier)
- `docs/RAPPORT.md`
- `docs/PLAN.md` (copie de PLAN_BUILD_ATHLORA_CLAUDE_CODE.md)
- `.env.example` (template variables d'environnement)

#### ✅ Projet Next.js 16.4.6 initialisé
- **Next.js 16.4.6** + React 19.3.0
- **Tailwind CSS v4** (avec @tailwindcss/turbopack)
- TypeScript strict
- App Router + Turbopack
- Alias `@/*` → `src/*`

#### ✅ package.json mis à jour
- Nom : `athlora`
- Scripts ajoutés : `typecheck`, `db:generate`, `db:migrate`, `db:studio`, `db:seed`, `admin:create`

#### ✅ Git initialisé + 2 commits
- `4a3e34b` — chore: phase 0 — CLAUDE.md, settings, skills, agents, LOG, RAPPORT, PLAN
- `bdf159f` — chore: phase 0 — Next.js 16.4.6 + Tailwind v4, scripts db/admin, .env.example

#### ⏳ EN ATTENTE — Actions manuelles requises (Phase 0)
- [ ] GitHub : créer repo privé `athlora`, ajouter remote, pousser
- [ ] Neon : créer projet `athlora`, région AWS Frankfurt, créer branche `dev` depuis `main`, copier les 4 URLs DB
- [ ] Vercel : décider plan (Pro pour site client), ne pas encore importer le repo
- [ ] Google Cloud : activer Maps Embed API, créer clé restreinte par domaine et par API
- [ ] Renseigner `.env.local` avec les vraies valeurs
- [ ] Envoyer au client la liste de contenu (§13.1 du plan) avec deadline J5
- [ ] Installer MCP Neon : `npx neon@latest init`
- [ ] Installer MCP next-devtools : `claude mcp add next-devtools -- npx -y next-devtools-mcp@latest`
- [ ] Vérifier dans Claude Code : `/mcp` → neon ✔ next-devtools ✔

---

## PHASE 1 — Fondations

_À démarrer après validation de la Phase 0 (comptes + env configurés)_

Tâches prévues :
- Installer toutes les dépendances (next-intl, zod, drizzle-orm, jose, bcryptjs, @vercel/blob…)
- Configurer next-intl (routing.ts, navigation.ts, request.ts, proxy.ts, next.config.ts)
- Créer l'arborescence complète (src/app/[locale]/, src/app/admin/, src/components/, src/lib/…)
- Layout [locale] avec lang/dir dynamiques, polices FR + AR via next/font
- messages/fr.json et messages/ar.json (tous namespaces)
- Header + Footer depuis les maquettes Stitch
- Déploiement preview Vercel

---

_Sections suivantes ajoutées au fur et à mesure._
