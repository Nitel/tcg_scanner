# ADR 008 : moteur OCR

- Statut : **Proposé** (à trancher après le banc d'essai)
- Date : 2026-11-27

## Contexte
La précision et la vitesse sur un petit numéro imprimé, parfois sur fond chargé ou brillant, ne sont pas connues.

## Décision (provisoire)
Aucun moteur retenu. Candidat envisagé : ML Kit Text Recognition sur l'appareil. L'OCR est derrière `OcrPort`, sans type propre à un moteur.

Critères du banc d'essai (`eval/`) : taux de lecture exacte, taux de faux positifs, latence par image, fonctionnement hors ligne, gratuité, licence, effort d'intégration Capacitor, support iOS. Facultatif : détection de l'étoile des versions alternatives au-dessus du numéro (ADR 015).

## Alternatives à comparer
- ML Kit (plugin Capacitor existant ou plugin maison).
- Tesseract (WebAssembly ou natif).
- OCR en ligne : écarté d'office (ADR 003).

## Conséquences
- Pas de dépendance OCR avant la décision.
- `TODO(à vérifier)` : un OCR de texte ne lira peut-être pas l'étoile, qui est un symbole.
