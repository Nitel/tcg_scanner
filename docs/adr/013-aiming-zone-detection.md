# ADR 013 : détection par zone de visée et fond calibré

- Statut : Accepté (seuils validés sur bois blanc seulement)
- Date : 2026-11-27
- Précise l'ADR 011

## Contexte
Premier usage : téléphone fixe au-dessus de la table, fond variable mais uni (bois, noir, blanc). La carte est posée puis retirée avant la suivante.

## Décision
- Une zone de visée fixe, au format d'une carte, est affichée sur l'aperçu.
- L'utilisateur calibre avec la zone vide : l'app mémorise le fond.
- Chaque image est réduite à une grille. On mesure la part de la zone qui diffère du fond (occupation) et l'écart avec l'image précédente (mouvement).
- Les variations d'exposition et de balance des blancs sont compensées à partir de ce qui entoure la zone.
- La zone est aussi découpée en 3 × 3 blocs. Une carte n'entre que si chacun est occupé à 50 % au moins : une carte en partie hors du cadre n'est pas comptée. Un léger décalage reste accepté, le numéro restant à l'image.
- Entrée : zone occupée, tous les blocs couverts et image stable pendant plusieurs images. Sortie : zone redevenue vide pendant plusieurs images. Les deux seuils d'occupation sont différents pour éviter les oscillations.
- Aucune dépendance. Les calculs sont en TypeScript, testés avec des images fabriquées.

## Essais sur le téléphone
2026-11-28, bois blanc, avant le contrôle par blocs : 20 puis 50 passages bien comptés, aucune détection pendant une minute à vide. Défaut constaté : une carte en partie hors du cadre était détectée.

Même jour, avec le contrôle par blocs : carte coupée non comptée, passages corrects. Autres fonds non essayés.

## Alternatives rejetées
- Détection de contours (OpenCV ou équivalent) : dépendance lourde, inutile tant que la carte est toujours au même endroit.
- API native de détection : `TODO(à vérifier)`, et code natif à écrire.

## Conséquences
- On détecte une zone occupée, pas un rectangle : un objet immobile qui la remplit compte comme une carte.
- Le dos n'est pas distingué de la face, et rien ne prouve que le numéro est lisible : la lecture du numéro s'en chargera (ADR 006).
- Déplacer le téléphone ou le fond impose de recalibrer.
- Les cartes empilées (la zone ne se vide jamais) ne sont pas gérées : tâche suivante.

## Quand revenir sur ce choix
Passer à la détection de contours (nouvel ADR) si, après réglage des seuils, les passages sont mal comptés sur les fonds visés, ou si le téléphone doit être tenu à la main.
