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
7. Mettre à jour docs/LOG.md avec les résultats de l'audit.
