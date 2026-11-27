# tcg_scanner

App qui scanne du bulk de cartes One Piece TCG (set OP18) : lecture du numéro imprimé par OCR, identification hors ligne, export CSV/JSON trié.

> État : documentation en place, application pas encore générée. Voir [docs/STATUS.md](docs/STATUS.md). Les commandes `npm` ci-dessous fonctionneront une fois le squelette créé.

## Prérequis
- git (macOS : `xcode-select --install`)
- Node 24 LTS (npm inclus)
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
npm run build
```

## Lancer sur un téléphone Android (débogage USB)
1. Sur le téléphone : Paramètres > À propos du téléphone, toucher 7 fois « Numéro de build » (le libellé varie selon le fabricant).
2. Options pour les développeurs : activer « Débogage USB ».
3. Brancher le téléphone et accepter la demande d'autorisation.
4. Rendre `adb` accessible (macOS, emplacement par défaut du SDK) :
   ```sh
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$PATH:$ANDROID_HOME/platform-tools"
   ```
5. Vérifier avec `adb devices` : le téléphone doit apparaître avec l'état `device`.
6. Lancer :
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
