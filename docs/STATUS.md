# État du projet

Dernière mise à jour : 2026-11-27

## Fait
- `CLAUDE.md`, ADR 001 à 011 (seul le 008 reste « Proposé »), `README.md`, `.gitignore`, `docs/DEPENDENCIES.md`.
- Dépôt public : aucune donnée ni image tierce versionnée.

## En cours
- Setup (branche `chore/project-setup`) : squelette applicatif.

## Bloqué
- Node 24 introuvable sur la machine.
- Android Studio absent (nécessaire au premier lancement sur téléphone).

## Prochaine étape
Une tâche = une branche = une PR.
1. Finir le setup : squelette Angular + Capacitor Android (`io.github.nitel.tcgscanner`), lint/format/tests, ports (dont `CardDetectorPort`), test d'exemple dans `domain`, CI.
2. Aperçu caméra sur le téléphone.
3. Détection d'une carte dans le cadre (entrée et sortie), validée sur le téléphone avant de continuer.
4. Lecture du numéro (banc d'essai OCR, ADR 008).
5. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
Voir les `TODO(à vérifier)` des ADR.
