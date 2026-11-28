# État du projet

Dernière mise à jour : 2026-11-28

## Fait
- Setup (PR #1) et aperçu caméra (PR #2) fusionnés dans `main`. Aperçu mesuré sur téléphone : 1080 × 1920, 15 à 30 images lues par seconde.
- Branche `feat/card-detection` : détection par zone de visée et fond calibré (ADR 013), entrées et sorties comptées.
- Vérifié en local : format, lint, 63 tests (images fabriquées), build.

## En cours
- PR `feat/alternative-category` (ADR 015) : à pousser et relire.
- Fusionnées : détection (PR #3, validée sur bois blanc uniquement), jeu d'essai OCR (PR #4).
- Jeu d'essai local : 32 photos 2160 × 3840 et `truth.txt` dans `eval/captures/`.

## Bloqué
Rien.

## Prochaine étape
1. Banc d'essai OCR (ADR 008), puis intégration de la lecture du numéro.
2. Mode pile : les cartes sont empilées sous la caméra, on retire celle du dessus pour lire la suivante. La zone ne se vide qu'à la fin. Piste : nouvelle carte au changement de numéro ; pour deux cartes identiques à la suite, repérer le mouvement du retrait (immobile, mouvement, immobile). Demandera un ADR qui revoit l'ADR 006.
3. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
- Autres fonds et reflets.
- Seuils de détection (`DEFAULT_PRESENCE_SETTINGS`, niveau de cellule changée).
- Dos de carte : sortira en `unreadable` une fois la lecture du numéro en place.
- Voir les `TODO(à vérifier)` des ADR.
