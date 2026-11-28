# État du projet

Dernière mise à jour : 2026-11-28

## Fait
- Setup (PR #1) et aperçu caméra (PR #2) fusionnés dans `main`. Aperçu mesuré sur téléphone : 1080 × 1920, 15 à 30 images lues par seconde.
- Branche `feat/card-detection` : détection par zone de visée et fond calibré (ADR 013), entrées et sorties comptées.
- Vérifié en local : format, lint, 63 tests (images fabriquées), build.

## En cours
PR 1 de l'intégration, `feat/ocr-reading` (ADR 016, 83 tests) : à pousser et relire.
- Plugin ML Kit maison, app sans autorisation Internet.
- 30 / 32 photos relues en JPEG, aucune fausse lecture.
- En direct sur téléphone : numéros bien lus, rapide et fluide, cartes brillantes comprises ; un dos reste en « Lecture… ».

Anomalie ouverte : une fois, une sortie détectée après environ 15 secondes. Pas reproduite sur un peu moins de 40 cartes ; cause inconnue. Si elle revient, relever la valeur « occupation » (au-dessus de 25 % : cadre non vu comme vide ; près de 0 % : erreur de logique).

## Bloqué
Rien.

## Prochaine étape
1. PR 2, `feat/card-counting` : comptage (ADR 006), `unreadable`, liste à l'écran ; deux lectures identiques pour changer de numéro pendant un même passage.
2. Mode pile : les cartes sont empilées sous la caméra, on retire celle du dessus pour lire la suivante. La zone ne se vide qu'à la fin. Piste : nouvelle carte au changement de numéro ; pour deux cartes identiques à la suite, repérer le mouvement du retrait (immobile, mouvement, immobile). Demandera un ADR qui revoit l'ADR 006.
3. Comptage et anti-doublon, catalogue, tri et export.

## À vérifier
- Autres fonds et reflets.
- Seuils de détection (`DEFAULT_PRESENCE_SETTINGS`, niveau de cellule changée).
- Dos de carte : sortira en `unreadable` une fois la lecture du numéro en place.
- Voir les `TODO(à vérifier)` des ADR.
