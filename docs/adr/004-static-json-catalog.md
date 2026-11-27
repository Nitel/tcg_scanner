# ADR 004 : catalogue JSON statique généré depuis la source officielle

- Statut : Accepté
- Date : 2026-11-27

## Contexte
L'app doit valider un numéro et connaître couleur et rareté, hors ligne.

## Décision
Un script (`tools/catalog`) génère `catalog.op18.json` sur le poste du développeur ; le fichier est embarqué dans l'app mais **jamais versionné** (dépôt public). La CI et les tests utilisent un catalogue fictif.
- Source : liste officielle, `en.onepiece-cardgame.com/cardlist/?series=569118` (HTML ; aucune API officielle documentée trouvée). Contrôle croisé avec `fr.onepiece-cardgame.com/cardlist/?series=622118`.
- Une entrée par numéro. Une variante a un identifiant suffixé `_p1`, `_p2`, `_p3`.
- Champs : `card_number`, `set_id` (`OP18`, le produit qui contient la carte), `colors`, `rarity`. Ni image, ni texte d'effet, ni nom.
- Numéro sans entrée de base dans la liste OP-18 : rareté lue dans la liste de son set d'origine.

Relevé du 2026-11-27 (EN) : 159 entrées, 125 numéros, mêmes numéros en FR. 119 sont des `OP18`. Les 6 autres, d'autres préfixes, n'y figurent qu'en variante.

## Alternatives rejetées
- API tierce : non officielle, fiabilité inconnue.
- Saisie manuelle : lente, source d'erreurs.

## Conséquences
- Le script dépend d'une structure HTML qui peut changer ; il échoue si elle n'est pas reconnue.
- Le site indique : « All images, text and data on this website may not be reproduced without permission. » Le dépôt ne contient donc ni données, ni images, ni pages du site ; l'usage reste personnel et l'app n'est pas distribuée (APK compris). Cela réduit le risque sans valoir autorisation.
- Chaque poste doit générer son catalogue avant de construire l'app.
