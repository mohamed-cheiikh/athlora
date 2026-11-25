---
name: stitch-convert
description: Convertit un écran Stitch de stitch_athlora_sports_tourism_platform/ en composants Next.js 16 bilingues FR/AR. À utiliser pour intégrer une maquette Stitch.
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
9. Mets à jour docs/COMPONENTS.md et docs/LOG.md.
