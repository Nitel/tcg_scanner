# ADR 011 : détection de la carte à l'écran

- Statut : Accepté (première technique : ADR 013)
- Date : 2026-11-27

## Contexte
L'ADR 006 exige de savoir quand le rectangle d'une carte entre et sort du cadre.

## Décision
La détection est un port distinct, `CardDetectorPort`, séparé de `OcrPort`. Elle détecte une forme, pas l'illustration : l'ADR 002 reste valable. Idéalement le rectangle entier.

## Alternatives à comparer
- Détection de contours (ex. OpenCV) : dépendance lourde.
- API native de détection d'objets ou de documents : `TODO(à vérifier)` qu'elle convienne à un flux vidéo, hors ligne.
- Zone de visée fixe avec mesure de changement d'image : plus simple, moins robuste.

## Conséquences
- Risque technique à mesurer tôt : fond peu contrasté, reflets, doigts, pile de cartes sous la carte visée.
- Aucune dépendance avant le choix de la technique.
