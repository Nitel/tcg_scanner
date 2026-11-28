# ADR 008 : moteur OCR

- Statut : Accepté
- Date : 2026-11-28

## Contexte
La précision et la vitesse sur un petit numéro imprimé n'étaient pas connues.

## Décision
**ML Kit Text Recognition**, sur l'appareil, modèle latin. L'OCR reste derrière `OcrPort`, sans type propre au moteur.

La façon de l'appeler (plugin existant ou plugin maison) est à décider à l'intégration.

## Banc d'essai (2026-11-28)
32 photos 2160 × 3840 d'un téléphone fixe, un seul fond (bois blanc) et un seul éclairage, cartes sans pochette dont 4 brillantes. Une photo ne contient pas la carte (prise pendant son retrait) : 31 exploitables. Recherche du numéro avec correction des confusions, comparée à la liste saisie à la main.

| Moteur, image | Lectures exactes | Fausses | Temps médian |
|---|---|---|---|
| ML Kit, photo entière réduite de moitié | 31 / 31 | 0 | 135 ms |
| ML Kit, coin du numéro réduit de moitié | 30 / 31 | 0 | 71 ms |
| ML Kit, coin du numéro | 29 / 31 | 0 | 85 ms |
| ML Kit, photo entière | 25 / 31 | 0 | 268 ms |
| Tesseract.js, coin du numéro | 7 / 31 | 1 à 2 | 283 ms |
| Tesseract.js, photo entière | 4 / 31 | 0 | 1508 ms |
| Tesseract.js, photo entière réduite de moitié | 4 / 31 | 0 | 631 ms |
| Tesseract.js, coin du numéro réduit de moitié | 0 / 31 | 1 à 2 | 145 ms |

Critères fixés avant la mesure : au moins 95 % de lectures exactes, aucune fausse, moins de 500 ms. Seul ML Kit les remplit.

Observations :
- réduire l'image de moitié aide ML Kit. Cela suggère qu'un flux 1080p suffirait (`TODO(à vérifier)` sur un tel appareil) ;
- la correction des confusions n'a rien changé pour ML Kit, et a ajouté une fausse lecture à Tesseract ;
- un échec sur le coin vient du chiffre qui suit le numéro, collé à lui (`OP18-0095`) ;
- les temps excluent la préparation de l'image et son écriture sur disque.

Réglages de Tesseract : texte épars, alphabet restreint, modèle `eng` `best_int`, sans prétraitement. Un prétraitement pourrait l'améliorer ; l'écart a été jugé trop grand pour le poursuivre.

Le code temporaire du banc d'essai est dans l'historique (commit `010a519`).

## Alternatives rejetées
- Tesseract.js : précision très insuffisante dans ces conditions.
- OCR en ligne : écarté d'office (ADR 003).

## Conséquences
- Code natif ou plugin tiers sur Android, à refaire ou vérifier pour iOS.
- Google indique que ses SDK ML Kit collectent des données de diagnostic et d'usage ([déclaration](https://developers.google.com/ml-kit/android-data-disclosure)). `TODO(à vérifier)` : ce que cela couvre avec le modèle embarqué.
- L'étoile des versions alternatives (ADR 015) n'a pas été évaluée.
- La lecture doit porter sur une image stable : une carte en cours de retrait ne se lit pas.
