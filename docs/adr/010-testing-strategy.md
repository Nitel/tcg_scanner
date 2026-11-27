# ADR 010 : stratégie de tests

- Statut : Accepté
- Date : 2026-11-27

## Contexte
Le risque principal est la qualité de lecture ; le reste est de la logique déterministe.

## Décision
- Tests unitaires Vitest (via `ng test`) sur `domain` et `application` : validation, normalisation, anti-doublon, catégorisation, tri, export. Ports remplacés par des doublures écrites à la main.
- Qualité OCR : banc d'essai séparé sur des images réelles (`eval/`).
- Caméra et adapters natifs : vérification manuelle sur téléphone.
- CI : format, lint, tests, build web.

## Alternatives rejetées
- Tests bout en bout sur émulateur : coûteux, caméra peu représentative.
- Objectif de couverture chiffré : peu utile à ce stade.

## Conséquences
- Une régression native n'est pas détectée par la CI (pas de build APK en v0).
