# État du projet

Dernière mise à jour : 2026-11-27

## Fait
- Setup fusionné dans `main` (PR #1), CI verte.
- Branche `feat/camera-preview` : aperçu caméra (ADR 012), permission Android, coupure en arrière-plan, affichage de la résolution et du débit d'images.
- Vérifié en local : format, lint, 29 tests, build, `android:sync`, compilation de l'APK.

## En cours
- PR `feat/camera-preview` : à pousser et relire. Aperçu validé sur téléphone : fluide, 1080 × 1920, 15 à 30 images lues par seconde.

## Bloqué
Rien.

## Prochaine étape
1. Détection d'une carte dans le cadre (entrée et sortie), validée sur le téléphone avant de continuer.
2. Lecture du numéro (banc d'essai OCR, ADR 008).
3. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
- ADR 012 : le débit suffit-il une fois la détection branchée ?
- Voir les `TODO(à vérifier)` des ADR.
