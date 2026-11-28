# ADR 014 : image réduite pour l'analyse, pleine résolution à la demande

- Statut : Accepté (à confirmer par les mesures sur téléphone)
- Date : 2026-11-28
- Amende l'ADR 012

## Contexte
Le numéro imprimé est très petit. La lecture a besoin d'une résolution plus haute que 1080 × 1920, mais lire tous les pixels de chaque image à cette taille ferait chuter le débit.

## Décision
- Le flux caméra est demandé en 3840 × 2160 (l'appareil donne ce qu'il peut).
- `CameraPort.start` livre des images réduites à 540 pixels de large, pour la détection. La réduction passe par `createImageBitmap`.
- `CameraPort.snapshot` rend l'image courante en pleine résolution, pour la lecture et le jeu d'essai.

## Alternatives rejetées
- Tout lire en pleine résolution : coûteux pour une détection qui n'en a pas besoin.
- Rester en 1080 × 1920 : risque de caractères trop petits pour l'OCR.

## Conséquences
- La zone de visée est recalculée pour chaque taille d'image, avec les mêmes proportions.
- Un appareil sans 4K donnera une résolution plus faible, avec des caractères plus petits : `TODO(à vérifier)` la résolution minimale avec le banc d'essai.

## Mesures sur le téléphone de test (2026-11-28)
- Photos en 2160 × 3840 ; numéro net, caractères d'une vingtaine de pixels de haut.
- Réduire en dessinant la vidéo 4K dans un petit canvas coûtait 254 ms par image (4 images/s). Avec `createImageBitmap` : 36 ms mesurés, 29 images/s dans l'app.
- Photo pleine résolution : environ 290 ms, plus 370 ms d'encodage PNG. La lecture du numéro devra ne copier que la zone utile.
