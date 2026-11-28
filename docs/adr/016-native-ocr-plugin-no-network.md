# ADR 016 : plugin OCR maison, application sans réseau

- Statut : Accepté
- Date : 2026-11-28
- Complète les ADR 003 et 008

## Contexte
ML Kit est retenu (ADR 008). Reste la façon de l'appeler. Ses SDK collectent des données de diagnostic, alors que l'app doit rester locale.

## Décision
- Plugin Capacitor maison (`CardOcrPlugin.java`) : l'image passe en mémoire (JPEG base64), seul le modèle latin est embarqué.
- Image envoyée : la zone de visée avec 10 % de marge, réduite de moitié, découpée directement dans le flux vidéo.
- Lecture quand la carte est immobile, répétée jusqu'au succès ou au retrait.
- Seul un numéro exact et unique est accepté, sans correction des confusions.
- Les autorisations `INTERNET` et `ACCESS_NETWORK_STATE` sont retirées du manifeste, y compris celles qu'ajouteraient les bibliothèques.

## Vérification (2026-11-28)
Sur téléphone : l'app démarre sans ces autorisations ; l'APK ne demande que la caméra. Les 32 photos du jeu d'essai relues en JPEG par le plugin : 30 lectures exactes, aucune fausse, 147 ms en médiane (encodage compris). Non lues : la photo sans carte, et une carte brillante dont le chiffre voisin s'est collé au numéro (`OP18-1175`).

En direct : numéros bien lus, cartes brillantes comprises, aucun numéro sur un dos de carte.

## Alternatives rejetées
- Plugin existant `@capacitor-mlkit/text-recognition` : écriture disque à chaque lecture, modèles d'autres alphabets déclarés.
- Accepter un chiffre en trop après le numéro : risque de fausse lecture, alors qu'une nouvelle tentative ne coûte presque rien.

## Conséquences
- Code natif à réécrire en Swift pour iOS.
- Le rechargement à chaud depuis le Mac, qui passe par le réseau, demanderait de rétablir `INTERNET` en développement.
- L'app ne peut ouvrir aucune connexion. `TODO(à vérifier)` : ML Kit ne délègue aucun envoi à un autre composant du téléphone.
- La CI ne compile pas le code Java.
