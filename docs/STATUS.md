# État du projet

Dernière mise à jour : 2026-11-28

## Fait
- Setup (PR #1) et aperçu caméra (PR #2) fusionnés dans `main`. Aperçu mesuré sur téléphone : 1080 × 1920, 15 à 30 images lues par seconde.
- Branche `feat/card-detection` : détection par zone de visée et fond calibré (ADR 013), entrées et sorties comptées.
- Vérifié en local : format, lint, 63 tests (images fabriquées), build.

## En cours
- PR `feat/ocr-benchmark` : recherche du numéro dans `domain`, ADR 008 tranché (ML Kit, 31 / 31 sur les photos exploitables, aucune fausse lecture). À pousser et relire.
- Jeu d'essai local : `eval/captures/` (32 photos, `truth.txt`, `results.json`).

## Bloqué
Rien.

## Prochaine étape
1. Intégration de la lecture du numéro avec ML Kit : choisir plugin existant ou maison ; lire seulement sur image stable.
2. Mode pile : les cartes sont empilées sous la caméra, on retire celle du dessus pour lire la suivante. La zone ne se vide qu'à la fin. Piste : nouvelle carte au changement de numéro ; pour deux cartes identiques à la suite, repérer le mouvement du retrait (immobile, mouvement, immobile). Demandera un ADR qui revoit l'ADR 006.
3. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
- Autres fonds et reflets.
- Seuils de détection (`DEFAULT_PRESENCE_SETTINGS`, niveau de cellule changée).
- Dos de carte : sortira en `unreadable` une fois la lecture du numéro en place.
- Voir les `TODO(à vérifier)` des ADR.
