# ADR 002 : OCR du numéro imprimé, clé = numéro de carte

- Statut : Accepté
- Date : 2026-11-27

## Contexte
Il faut identifier vite des cartes en vrac, en anglais et en français. Le numéro imprimé est identique dans les deux langues.

## Décision
La carte est identifiée uniquement par son numéro (ex. `OP18-042`), lu par OCR, normalisé puis validé contre le catalogue. Aucune reconnaissance visuelle de l'illustration.

## Alternatives rejetées
- Reconnaissance visuelle : jeu d'images et modèle à maintenir, coût élevé.
- OCR du nom : dépend de la langue.

## Conséquences
- La langue de la carte n'est pas connue.
- Les variantes d'un même numéro sont indiscernables (voir ADR 005).
- Une carte réimprimée dans OP-18 (ex. `OP17-119`) ne se distingue pas de l'originale.
- La normalisation des confusions OCR (`O`/`0`, etc.) est une logique du domaine, testée.
