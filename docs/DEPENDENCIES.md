# Dépendances

Toute dépendance ajoutée au-delà de ce que pose le générateur Angular est justifiée ici.

| Dépendance | Rôle | Justification | Ajoutée le |
|---|---|---|---|
| `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` | App Android | ADR 001 | 2026-11-27 |
| `eslint`, `@eslint/js`, `typescript-eslint`, `angular-eslint` | Lint | Standard Angular ; impose aussi les frontières de couches (ADR 009) | 2026-11-27 |
| `prettier` (racine) | Format | Format unique, vérifié en CI ; déjà posé dans `app` par le générateur, ajouté à la racine pour couvrir tout le dépôt | 2026-11-27 |
| `@capacitor/filesystem` | Écriture de fichiers sur le téléphone | Plugin officiel Capacitor (MIT). Photos du jeu d'essai OCR ; resservira pour l'export (ADR 007) | 2026-11-28 |
| `com.google.mlkit:text-recognition` (Gradle) | OCR sur l'appareil | ADR 008 et 016. Conditions d'utilisation de ML Kit (Google), modèle latin embarqué | 2026-11-28 |

Posées par le générateur Angular : Angular, RxJS, `tslib`, TypeScript 6.0 (la 7 n'est pas acceptée par `@angular/build`), Vitest et `jsdom` (tests).
