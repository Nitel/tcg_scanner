# tcg_scanner

App mobile de scan de cartes One Piece TCG pour trier du bulk : la caméra filme les cartes, l'OCR lit le numéro imprimé (ex. `OP18-042`), un catalogue local l'identifie, puis export CSV/JSON trié.

Profil du développeur : Java/Angular, DevOps/full-stack.

## Règles de travail
1. Lire les ADR (`docs/adr/`) avant toute modification. Ne jamais contredire un ADR sans proposer un nouvel ADR.
2. Annoncer un plan court et **attendre la validation** avant de coder une tâche structurante.
3. Une tâche = une branche = une petite PR. Pas de refactoring hors périmètre.
4. Commits conventionnels : `feat`, `fix`, `docs`, `chore`, `test`, `refactor`.
5. Chaque PR décrit : ce qui change, ce qui est testé, ce qui ne l'est pas, les risques.
6. Ne pas inventer de données ni d'API. Une info incertaine est signalée et marquée `TODO(à vérifier)`.
7. Mettre à jour `docs/STATUS.md` en fin de session : fait, en cours, bloqué, prochaine étape.
8. Répondre en français ; code et identifiants en anglais.

## Périmètre v0
- Set OP18 uniquement. Cartes EN et FR, même numéro dans les deux langues.
- Android d'abord ; ne rien faire qui empêche iOS plus tard.
- Catégories de sortie : `op18`, `foil`, `unreadable`, `other_set`.
- Hors ligne, sans backend, coût zéro.
- Hors périmètre : comptes, prix, sync cloud, iOS, reconnaissance visuelle, variantes/alt arts, publication sur les stores.

## Stack
Angular 22 + Capacitor 8, TypeScript 6.0 strict, Node 26, npm workspaces. Moteur OCR et détection de carte **non tranchés** (ADR 008, 011) : toujours passer par `OcrPort` et `CardDetectorPort`.

## Structure
- `app/` : application Angular + Capacitor (projet natif dans `app/android/`)
  - `src/app/domain/` : TypeScript pur, aucune dépendance Angular/Capacitor
  - `src/app/application/` : cas d'usage ; `ports/` contient les interfaces
  - `src/app/infrastructure/` : adapters (caméra, détection de carte, OCR, catalogue, stockage, export)
  - `src/app/ui/` : composants Angular
- `tools/catalog/` : script de génération de `catalog.op18.json`
- `eval/` : jeu de test OCR
- `docs/` : `adr/`, `STATUS.md`, `DEPENDENCIES.md`

## Commandes
Depuis la racine (`nvm use` d'abord) :

| Commande | Effet |
|---|---|
| `npm ci` | installation reproductible |
| `npm start` | serveur web de dev |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:watch` | tests unitaires (Vitest via `ng test`) |
| `npm run build` | build web |
| `npm run android:sync` | build puis `cap sync android` |
| `npm run android:open` | ouvre Android Studio |
| `npm run android:run` | lance sur un téléphone en USB |

## Conventions
- Dépendances entre couches : `domain` ← `application` ← `infrastructure` et `ui`. `ui` n'importe pas `infrastructure`, sauf au point d'assemblage (providers).
- La logique métier est testée sans téléphone.
- Pas de nouvelle dépendance sans justification dans `docs/DEPENDENCIES.md`.
- Pas de sur-ingénierie.

## Dépôt public
Ne jamais versionner de contenu tiers : catalogue généré, pages ou images du site officiel, photos et vidéos de cartes (ADR 004). Tests et CI utilisent des données fictives.
