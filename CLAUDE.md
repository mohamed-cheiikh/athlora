# Athlora — instructions pour Claude Code

## Projet
Plateforme bilingue FR/AR de tourisme sportif pour toute l'Algérie : évènements, activités (sport/tourisme),
hébergements, formulaires de demande, back-office admin.
V1 (livrable PFE startup) : 3 villes — Alger, Oran, Mostaganem. Le filtre s'appelle "ville" (champ `zone` en BDD).
Seed : données réelles pour ces 3 villes. L'admin peut ajouter n'importe quelle ville ensuite.
Spécification complète : docs/PLAN.md — lis la section concernée avant chaque tâche.
Avancement : docs/RAPPORT.md — mets-le à jour à la fin de chaque phase.
Journal : docs/LOG.md — enregistre chaque action importante avec sa date.

## Stack
Next.js 16 (App Router, TS strict, Turbopack) · Tailwind CSS v4 · shadcn/ui (admin) · lucide-react
Neon Postgres + Drizzle ORM (driver neon-http, casing snake_case) · Zod · next-intl v4
Auth maison : bcryptjs + jose (cookie httpOnly) · Vercel Blob (images)
Pas de carte embarquée : lien direct Google Maps (https://www.google.com/maps/search/?api=1&query=lat,lng)

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
- Les maquettes de référence sont dans stitch_athlora_sports_tourism_platform/ (HTML + captures). Respecte-les fidèlement.
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
- Mets à jour docs/LOG.md et docs/RAPPORT.md à chaque avancement significatif.
