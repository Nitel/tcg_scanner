# ADR 006 : scan continu et anti-doublon

- Statut : Accepté
- Date : 2026-11-27

## Contexte
En scan continu, la même carte apparaît sur de nombreuses images. L'OCR lit du texte mais ne dit pas si une carte est présente.

## Décision
La présence d'une carte est détectée par son rectangle, et pilote la lecture :
1. un rectangle de carte entre dans le cadre : une détection démarre (OCR) ;
2. le numéro est lu : la carte est comptée une fois, l'OCR s'arrête pour elle ;
3. le rectangle sort du cadre : la détection se termine ;
4. sortie sans numéro lu : la carte est comptée `unreadable` ;
5. un nouveau rectangle entre : nouvelle détection.

La règle est une machine à états en TypeScript pur, testable avec des séquences simulées. La technique de détection est traitée par l'ADR 011.

## Alternatives rejetées
- Se fier à la seule disparition du numéro : une lecture ratée se confond avec une absence de carte.
- Une photo par carte : trop lent pour du bulk.
- Ne compter chaque numéro qu'une fois par session : fausse les quantités.

## Conséquences
- Deux exemplaires identiques comptent pour 2 si le rectangle sort entre les deux.
- v0 suppose une seule carte à la fois dans le champ.
- `TODO(à vérifier)` : nombre d'images avant de déclarer la sortie (tolérer une perte brève).
- Cartes glissées l'une sur l'autre sans que le rectangle sorte : un numéro différent compte comme une nouvelle carte, l'OCR continue donc à lire. Deux exemplaires identiques enchaînés ainsi comptent pour 1.
