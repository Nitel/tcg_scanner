# ADR 012 : accès caméra par l'API web

- Statut : Accepté
- Date : 2026-11-27

## Contexte
Il faut un aperçu en direct et l'accès aux pixels pour la détection (ADR 011) puis l'OCR (ADR 008).

## Décision
Caméra arrière via `getUserMedia` et un élément `<video>` dans la WebView. L'adapter lit les pixels RGBA à la résolution du flux et les passe par `CameraPort`. Aucune dépendance ajoutée. La demande d'autorisation est gérée par Capacitor, avec la permission `CAMERA` au manifeste.

## Mesures sur le téléphone de test (2026-11-27)
Aperçu fluide, flux en 1080 × 1920, entre 15 et 30 images lues par seconde en pleine résolution. Choix confirmé.

## Alternatives rejetées
- Plugin tiers d'aperçu : dépendance, et accès continu aux images incertain (`TODO(à vérifier)`).
- Plugin maison CameraX : plus performant, mais beaucoup de code natif, à refaire pour iOS.

## Conséquences
- Utilisable dans un navigateur de bureau, et n'empêche pas iOS.
- Peu de contrôle sur la mise au point, l'exposition et la résolution.
- Un OCR natif demanderait de transférer les images vers le code natif.

## Quand revenir sur ce choix
Passer à un plugin CameraX (nouvel ADR) si, sur le téléphone de test :
- le numéro n'est pas net à la distance de scan ;
- ou le débit de lecture est trop faible pour suivre le passage des cartes. Seuil : `TODO(à vérifier)` avec la détection.
