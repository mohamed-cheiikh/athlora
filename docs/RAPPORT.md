# Athlora — Rapport d'avancement

**Projet :** Plateforme bilingue FR/AR — Tourisme sportif Mostaganem
**Stack :** Next.js 16 · Neon Postgres · Drizzle ORM · next-intl · Tailwind v4
**Dernière mise à jour :** 25/11/2026

---

## Statut global

| Phase | Nom | Statut | % |
|-------|-----|--------|---|
| 0 | Préparation | 🔄 En cours | 60% |
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

## Phase 0 — Préparation

### ✅ Fait
- Structure dossiers créée (`.claude/`, `docs/`)
- Écrans Stitch détectés : 4 screens avec code.html (Accueil, Événements, Activités, Hébergements) + tokens design
- `CLAUDE.md` créé avec toutes les règles Next.js 16 + RTL + sécurité
- `.claude/settings.json` avec permissions (allow/ask/deny)
- 3 skills créés : `stitch-convert`, `admin-crud`, `i18n-rtl-audit`
- 2 agents créés : `security-reviewer`, `rtl-reviewer`
- `docs/PLAN.md` copié
- Projet Next.js initialisé

### ⏳ En attente (manuel)
- [ ] GitHub repo privé `athlora`
- [ ] Neon : projet + branche `dev` + 4 URLs
- [ ] Vercel : plan décidé
- [ ] Google Maps API : clé restreinte
- [ ] `.env.local` renseigné
- [ ] Liste contenu envoyée au client

### Écrans Stitch — Inventaire
| Écran | Fichier | Statut |
|-------|---------|--------|
| Accueil | `athlora_plateforme_sport_aventure_mostaganem/code.html` | ✅ Disponible |
| Événements | `athlora_v_nements_comp_titions_mostaganem/code.html` | ✅ Disponible |
| Activités | `athlora_activit_s_outdoor_mostaganem/code.html` | ✅ Disponible |
| Hébergements | `athlora_h_bergements_s_jours_sportifs_mostaganem/code.html` | ✅ Disponible |
| Tokens design | `athletic_velocity_exploration/DESIGN.md` | ✅ Disponible |
| Détail événement | — | ❌ Manquant (à dériver) |
| Détail activité | — | ❌ Manquant (à dériver) |
| Détail hébergement | — | ❌ Manquant (à dériver) |
| Contact | — | ❌ Manquant (à dériver) |
| Admin | — | ❌ Manquant (shadcn/ui) |

---

## Décisions en suspens

| # | Question | Recommandation | Décidé ? |
|---|----------|---------------|----------|
| 1 | Hébergement Vercel : Hobby ou Pro ? | Pro (site client commercial) | ❌ |
| 2 | Zone géographique seed | Mostaganem (détecté dans les noms Stitch) | ✅ |
| 3 | Domaine | `.com` pour tenir le délai | ❌ |
| 4 | E-mail obligatoire formulaires demande ? | Téléphone obligatoire, e-mail facultatif | ✅ |
| 5 | Auth : maison ou Better Auth ? | Maison (un seul rôle) | ✅ |
| 6 | Images : Vercel Blob ? | Vercel Blob | ✅ |

---

## Problèmes ouverts

_Aucun pour l'instant._

---

## Prochaine étape

**Phase 1 — Fondations** : initialiser Next.js 16, configurer next-intl, créer l'arborescence, Header + Footer depuis Stitch, déployer sur Vercel.
