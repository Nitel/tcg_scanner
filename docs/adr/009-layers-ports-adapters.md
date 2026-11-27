# ADR 009 : architecture en couches, ports/adapters

- Statut : Accepté
- Date : 2026-11-27

## Contexte
L'OCR et la caméra doivent être remplaçables, et la logique testable sans téléphone.

## Décision
- `domain` : TypeScript pur, aucune dépendance Angular/Capacitor.
- `application` : cas d'usage ; les ports sont dans `application/ports` : `CameraPort`, `OcrPort`, `CardDetectorPort`, `CatalogPort`, `SessionStoragePort`, `ExportPort`.
- `infrastructure` : adapters.
- `ui` : Angular.

Dépendances dirigées vers le domaine, contrôlées par ESLint (`no-restricted-imports`).

## Alternatives rejetées
- Services Angular appelant directement les plugins : non testable, moteur OCR figé.
- Paquets séparés par couche : sur-ingénierie pour la v0.

## Conséquences
- Un peu plus de fichiers et d'assemblage (providers).
- Changer de moteur OCR = écrire un nouvel adapter.
