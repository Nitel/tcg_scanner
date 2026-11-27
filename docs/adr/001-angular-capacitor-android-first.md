# ADR 001 : Angular + Capacitor, Android d'abord

- Statut : Accepté
- Date : 2026-11-27

## Contexte
Le développeur maîtrise Angular. L'app a besoin de la caméra et d'un OCR sur mobile. Seul Android sert aux tests pour l'instant ; iOS viendra peut-être.

## Décision
Angular (TypeScript strict) emballé par Capacitor. Seule la plateforme Android est ajoutée en v0. Tout code propre à une plateforme reste dans `infrastructure`.

## Alternatives rejetées
- Android natif (Kotlin) : bloque iOS, n'exploite pas les compétences Angular.
- Flutter, React Native : nouvel écosystème à apprendre.
- PWA seule : pas d'accès à un OCR natif.

## Conséquences
- iOS reste possible en ajoutant la plateforme et les adapters.
- Le passage des images entre la WebView et le natif peut limiter la cadence de scan. `TODO(à vérifier)` au banc d'essai.
