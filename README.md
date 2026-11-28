# tcg_scanner

App qui scanne du bulk de cartes One Piece TCG (set OP18) : lecture du numéro imprimé par OCR, identification hors ligne, export CSV/JSON trié.

> État : détection d’une carte et lecture de son numéro en place ; comptage et export à venir. Fonctionne sans autorisation Internet. Voir [docs/STATUS.md](docs/STATUS.md).

## Prérequis
- git (macOS : `xcode-select --install`)
- Node 26 (voir `.nvmrc`, npm inclus). Avec nvm : `nvm install`
- Android Studio 2025.2.1 ou plus récent, avec le SDK Android (API 36). Il fournit le JDK et `adb`.
- Un téléphone Android 7.0 (API 24) ou plus récent et un câble USB de données

## Installation
```sh
git clone https://github.com/Nitel/tcg_scanner.git
cd tcg_scanner
npm ci
```

## Développement
```sh
npm start      # serveur web
npm test       # tests unitaires
npm run lint
npm run format
npm run build
```

## Lancer sur un téléphone Android (débogage USB)
1. Sur le téléphone : Paramètres > À propos du téléphone, toucher 7 fois « Numéro de build » (le libellé varie selon le fabricant).
2. Options pour les développeurs : activer « Débogage USB ».
3. Brancher le téléphone et accepter la demande d'autorisation.
4. Ouvrir une fois le dossier `app/android` dans Android Studio. Dans Settings > Build, Execution, Deployment > Build Tools > Gradle, choisir « Download JDK » en version 21 pour « Gradle JDK » (Gradle 8.14 ne tourne pas sur le JDK 25 fourni avec Android Studio 2026.2). Refuser les mises à jour de Gradle ou du plugin Android.
5. Préparer le terminal, **à la racine du dépôt** (macOS) :
   ```sh
   cd chemin/vers/tcg_scanner
   nvm use
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$PATH:$ANDROID_HOME/platform-tools"
   export JAVA_HOME="$(/usr/libexec/java_home -v 21)"
   ```
6. Vérifier avec `adb devices` : le téléphone doit apparaître avec l'état `device`.
7. Lancer :
   ```sh
   npm run android:sync
   npm run android:run
   ```
   Ou `npm run android:open`, puis « Run » dans Android Studio.

## Documentation
- [Règles de travail](CLAUDE.md)
- [Décisions d'architecture](docs/adr/)

## Mentions
Projet personnel, non officiel, sans lien avec Bandai, Shueisha ou Toei Animation. ONE PIECE et ONE PIECE Card Game appartiennent à leurs détenteurs. Ce dépôt ne contient ni données ni images de cartes : le catalogue est généré localement et reste soumis aux conditions de sa source.
