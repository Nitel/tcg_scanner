# ADR 007 : format d'export et catégories de sortie

- Statut : Accepté (amendé par ADR 015)
- Date : 2026-11-27

## Contexte
Le résultat doit servir au rangement physique et s'ouvrir dans un tableur.

## Décision
Export CSV et JSON, une ligne par couple (catégorie, numéro) avec colonnes `category, set_id, card_number, color, rarity, quantity`. Catégories, dans l'ordre de sortie :
1. `op18` : numéro présent dans le catalogue.
2. `foil` : numéro du catalogue, carte reconnue comme foil.
3. `unreadable` : numéro non lu.
4. `other_set` (poubelle, en fin de fichier) : numéro valide absent du catalogue.

L'appartenance se décide par le catalogue, pas par le préfixe : `OP17-119` listée dans OP-18 est `op18`. Tri interne : set, couleur, rareté, numéro.

Foil : une étoile au-dessus du numéro (variante, ADR 005). Sa détection n'est pas prioritaire ; tant qu'elle n'existe pas, la catégorie reste vide et ces cartes sortent en `op18`. La catégorie `foil` l'emporte sur `op18`, réimpressions d'autres préfixes comprises.

## Alternatives rejetées
- Filtrer sur le préfixe `OP18` : exclut les cartes d'autres préfixes du booster.
- Une ligne par scan : peu exploitable pour trier.

## Conséquences
- Pour `other_set` et `unreadable`, les champs inconnus restent vides.
- CSV séparé par `;`, UTF-8 avec BOM (tableur en français). Raretés triées `SEC, SR, R, L, UC, C, P`. Carte multicolore en une seule ligne (`red/green`), classée après les monocolores.
- `TODO(à vérifier)` : ordre des couleurs.
- `TODO(à vérifier)` : moyen d'écrire et partager le fichier sur Android.
