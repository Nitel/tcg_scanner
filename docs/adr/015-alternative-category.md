# ADR 015 : la catégorie `foil` devient `alternative`

- Statut : Accepté
- Date : 2026-11-28
- Amende les ADR 005 et 007

## Contexte
Les ADR 005 et 007 appelaient « foil » les cartes portant une étoile. Or le vocabulaire retenu est : **foil** pour une carte brillante, **étoile** pour une version alternative.

## Décision
- La catégorie d'export `foil` est renommée `alternative` : numéro du catalogue, étoile au-dessus du numéro.
- Ses règles restent celles de l'ADR 007 : même place dans l'ordre de sortie, prioritaire sur `op18`, réimpressions comprises, et vide tant que l'étoile n'est pas détectée.
- Les cartes brillantes ne sont pas identifiées : elles suivent la catégorie de leur numéro.

Ordre de sortie : `op18`, `alternative`, `unreadable`, `other_set`.

## Alternatives rejetées
- Une catégorie pour les cartes brillantes : une image seule permet mal de les reconnaître.
- Garder le nom `foil` : trompeur à la lecture du CSV.

## Conséquences
- Dans les ADR antérieurs, la catégorie ou l'étoile « foil » se lit `alternative`.
- Aucun export existant à convertir.
