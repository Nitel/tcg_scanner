# État du projet

Dernière mise à jour : 2026-11-28

## Fait
- Setup (PR #1) et aperçu caméra (PR #2) fusionnés dans `main`. Aperçu mesuré sur téléphone : 1080 × 1920, 15 à 30 images lues par seconde.
- Branche `feat/card-detection` : détection par zone de visée et fond calibré (ADR 013), entrées et sorties comptées.
- Vérifié en local : format, lint, 63 tests (images fabriquées), build.

## En cours
Lecture du numéro, en trois PR : jeu d'essai, banc d'essai, intégration. Détection fusionnée (PR #3), validée sur bois blanc uniquement.

PR 1, `feat/eval-capture` (72 tests) : à pousser et relire.
- Photos en 2160 × 3840, numéro net ; jeu de 32 cartes et `truth.txt` dans `eval/captures/` (local).
- Détection lente corrigée (29 images/s mesurées), jugée « beaucoup mieux » à l'usage.
- Pas de recomptage formel des passages depuis la correction.

## Bloqué
Rien.

## Prochaine étape
1. Petite PR : la catégorie d'export `foil` devient `alternative` (cartes à étoile), avec un ADR qui amende les 005 et 007. Les cartes brillantes ne sont pas identifiées.
2. Banc d'essai OCR (ADR 008), puis intégration de la lecture du numéro.
3. Mode pile : les cartes sont empilées sous la caméra, on retire celle du dessus pour lire la suivante. La zone ne se vide qu'à la fin. Piste : nouvelle carte au changement de numéro ; pour deux cartes identiques à la suite, repérer le mouvement du retrait (immobile, mouvement, immobile). Demandera un ADR qui revoit l'ADR 006.
4. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
- Autres fonds et reflets.
- Seuils de détection (`DEFAULT_PRESENCE_SETTINGS`, niveau de cellule changée).
- Dos de carte : sortira en `unreadable` une fois la lecture du numéro en place.
- Voir les `TODO(à vérifier)` des ADR.
