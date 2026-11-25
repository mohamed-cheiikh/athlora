#!/usr/bin/env bash
# deploy-prod.sh — Script de déploiement production Athlora
# Usage : bash scripts/deploy-prod.sh
# Prérequis : .env.prod rempli avec les URLs Neon MAIN (voir .env.example)
#
# Ce script:
#   1. Vérifie que les variables de prod sont présentes
#   2. Applique les migrations sur la branche Neon MAIN
#   3. Crée le premier compte admin (si ADMIN_EMAIL est renseigné)
#   4. Lance le build final

set -e

ENV_FILE=".env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌  $ENV_FILE manquant. Crée-le à partir de .env.example avec les URLs de la branche Neon MAIN."
  echo ""
  echo "Variables requises :"
  echo "  DATABASE_URL=postgresql://...@...-pooler.../neondb?sslmode=require"
  echo "  DATABASE_URL_UNPOOLED=postgresql://...@.../neondb?sslmode=require"
  echo "  SESSION_SECRET=<32+ chars>"
  echo "  BLOB_READ_WRITE_TOKEN=<vercel blob token>"
  echo "  NEXT_PUBLIC_SITE_URL=https://ton-domaine.com"
  exit 1
fi

echo "✅  Chargement de $ENV_FILE"
set -o allexport
source "$ENV_FILE"
set +o allexport

echo ""
echo "🗄️  Migration Neon MAIN..."
npx drizzle-kit migrate
echo "✅  Migrations appliquées"

if [ -n "$ADMIN_NOM" ] && [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo ""
  echo "👤  Création du compte admin : $ADMIN_EMAIL"
  tsx --env-file="$ENV_FILE" scripts/create-admin.ts "$ADMIN_NOM" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

echo ""
echo "🏗️  Build de production..."
npm run build

echo ""
echo "✅  Prêt pour Vercel deploy !"
echo "   git push origin master"
echo "   (ou connecter le repo sur vercel.com si ce n'est pas encore fait)"
