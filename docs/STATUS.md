# État du projet

Dernière mise à jour : 2026-11-27

## Fait
- Squelette Angular 22 + Capacitor 8, plateforme Android (`io.github.nitel.tcgscanner`), Node 26.
- Couches et ports, lint avec frontières de couches, exemple `parseCardNumber` dans `domain`, workflow CI.
- Vérifié en local : format, lint, 13 tests, build, `android:sync`.
- `CLAUDE.md`, ADR 001 à 011 (seul le 008 reste « Proposé »), `README.md`, `.gitignore`, `docs/DEPENDENCIES.md`.
- Dépôt public : aucune donnée ni image tierce versionnée.

## En cours
- PR de setup (`chore/project-setup`) : à pousser et relire.

## Bloqué
- Android Studio absent : le projet natif n'a jamais été compilé ni lancé.
- CI jamais exécutée (rien n'est poussé).

## Prochaine étape
Une tâche = une branche = une PR.
1. Fusionner la PR de setup, installer Android Studio.
2. Aperçu caméra sur le téléphone.
3. Détection d'une carte dans le cadre (entrée et sortie), validée sur le téléphone avant de continuer.
4. Lecture du numéro (banc d'essai OCR, ADR 008).
5. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
Voir les `TODO(à vérifier)` des ADR.
