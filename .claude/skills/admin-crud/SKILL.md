---
name: admin-crud
description: Génère un CRUD admin complet pour une entité (évènements, activités, hébergements) selon le pattern du projet. À utiliser pour toute nouvelle gestion admin.
---
Pattern de référence : le CRUD Évènements (src/app/admin/(protected)/evenements, src/lib/actions/admin/evenements.ts).
Fichiers à produire pour l'entité X :
- src/lib/validation/X.ts : schéma Zod (FR obligatoire, AR facultatif, slug, publie, médias, localisation).
- src/lib/actions/admin/X.ts : create/update/delete/togglePublish. Chaque action : requireAdmin() en 1re ligne,
  validation Zod, db.batch() si associations, revalidatePath('/', 'layout'), retour { ok, errors }.
- Pages : liste (recherche, pagination, badge « AR manquant », publier/masquer, supprimer avec confirmation),
  nouveau, édition [id]. Formulaire avec onglets Français | العربية (champs AR en dir="rtl"), ImageUploader,
  lat/lng + lien Google Maps, slug auto depuis le titre FR (modifiable).
Checklist finale : lint, typecheck, build ; tester création, édition, publication, suppression, sur mobile et desktop ;
vérifier que la page publique reflète le changement. Mettre à jour docs/LOG.md et docs/RAPPORT.md.
