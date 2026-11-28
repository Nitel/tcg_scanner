# Banc d'essai OCR

Sert à choisir le moteur OCR (ADR 008). Les images restent sur votre machine : `captures/` n'est jamais versionné.

## Constituer le jeu d'essai
1. Dans l'app : démarrer la caméra, calibrer, cocher « Photographier chaque carte ».
2. Poser les cartes une à une, et attendre « Photo prise » avant de retirer chacune.
3. Téléphone branché, depuis la racine : `npm run eval:pull`. Les images arrivent dans `eval/captures/<session>/001.png`, …
4. Dans le même dossier, créer `truth.txt` : un numéro de carte par ligne, dans l'ordre des photos. Ajouter ` foil` après le numéro d'une carte foil.

Exemple de `truth.txt` (valeurs fictives) :
```
OP18-001
OP18-002 foil
```

Désinstaller l'app efface les photos restées sur le téléphone.

## Résultats
Voir l'[ADR 008](../docs/adr/008-ocr-engine.md).
