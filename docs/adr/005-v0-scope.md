# ADR 005 : périmètre v0

- Statut : Accepté
- Date : 2026-11-27

## Contexte
Livrer vite un tri de bulk utile.

## Décision
- Set OP18 uniquement ; cartes EN et FR ; Android.
- Une carte = un numéro. Les variantes ne sont pas distinguées entre elles.
- Raretés de base : `SEC`, `SR`, `R`, `L`, `UC`, `C`, et `P` (promo). `SP CARD` et `TR` n'apparaissent que sur des variantes.
- Une variante porte toujours une étoile au-dessus de son numéro (sortie : ADR 007).
- La rareté retenue est celle de l'entrée sans suffixe de variante (ADR 004).
- Hors périmètre : comptes, prix, sync cloud, iOS, reconnaissance visuelle de l'illustration, publication sur les stores.

## Alternatives rejetées
- Distinguer les variantes : exige une reconnaissance visuelle.
- Plusieurs sets : multiplie catalogue et tests avant d'avoir validé l'OCR.

## Conséquences
- Tant que l'étoile n'est pas détectée, une variante est comptée comme la carte de base.
- Les promos ont un numéro d'un autre format (`P-001`) : la validation du domaine doit l'accepter.
- La liste OP-18 ne contient aucune carte `P`.
