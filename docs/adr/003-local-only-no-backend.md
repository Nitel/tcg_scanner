# ADR 003 : tout local, pas de backend en v0

- Statut : Accepté
- Date : 2026-11-27

## Contexte
Usage personnel, hors ligne, coût visé nul.

## Décision
Aucun backend ni base distante. Catalogue embarqué dans l'app, session de scan dans IndexedDB, export sous forme de fichier. Aucun appel réseau à l'exécution, OCR compris.

## Alternatives rejetées
- Backend (API + base) : hébergement, comptes, maintenance sans besoin actuel.
- OCR en ligne : réseau requis, potentiellement payant.

## Conséquences
- Pas de synchronisation ni de sauvegarde : l'export est le seul moyen de conserver les données.
- Android peut effacer le stockage de l'app (désinstallation, « effacer les données »).
- Mettre à jour le catalogue impose de reconstruire l'app.
