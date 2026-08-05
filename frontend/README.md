# LEYDYMEN Academy — Frontend

Plateforme web Angular de gestion d'une école de bootcamp informatique (formations, étudiants, inscriptions, lecteur de cours, administration). Interface inspirée d'OpenedX, textes en français.

## Prérequis

- Node.js ≥ 20 (géré via `packageManager: npm@11.6.2`)
- Playwright Chromium pour Karma (voir `karma.conf.js`, variable `CHROME_BIN`)

## Installation

```bash
npm install
```

## Serveur de développement

```bash
npm start
```

Le serveur de développement est disponible sur `http://localhost:4200`. L'API mock (Express) est servie par le build SSR sur `http://localhost:4000/api` (voir `src/environments/`).

## Tests unitaires (Karma + Jasmine)

```bash
npm test
```

Les tests sont co-localisés (`*.spec.ts`) et s'exécutent dans Chromium headless.

## Build de production (SSR)

```bash
npm run build
```

Le build valide les budgets de bundle et prérend 5 routes publiques (`login`, `register`, `forgot-password`, `404`, `500`). Toutes les autres routes sont rendues côté client (l'authentification vit dans le stockage du navigateur).

```bash
npm run serve:ssr:frontend
```

Sert le build SSR sur le port `4000` (variable `PORT`).

## Comptes de démonstration (API mock)

| Rôle       | Identifiant   | Mot de passe |
| ---------- | ------------- | ------------ |
| Admin      | `admin`       | `admin123`   |
| Instructeur| `instructor`  | `instructor123` |
| Étudiant   | `student1`–`student3` | `student123` |

## Architecture

- Angular 21, composants standalone, signaux (`signal`/`computed`), contrôle de flux `@if`/`@for`
- SSR via Express (`src/server.ts`), API mock dans `src/server/mock-api.ts`
- Design system : tokens CSS (`src/assets/styles/_variables.scss`) et classes (`design-system.scss`)
- Routing : `src/app/app.routes.ts` (gardes `authGuard`, `roleGuard`)
- Services : `src/app/core/services/` (auth, user, formation, enrollment, progress, statistics)
- Pages : auth, erreurs, dashboard, formations (liste/détail/création/édition), étudiants, inscriptions, mes cours + lecteur, profil, administration

## Références

- Spécifications : `docs/specs_frontend.md` (dossier parent)
- Prompt de génération : `docs/fully-prompt.md`
