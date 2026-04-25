# Worganic Base — Template de projet

Stack complète Angular 18 + Express + Electron, prête à l'emploi pour démarrer un nouveau projet.

---

## Ce que contient ce template

| Composant | Port | Description |
|-----------|------|-------------|
| Angular 18 (frontend) | 4202 | Interface utilisateur — `frankenstein/` |
| server-data.js | 3001 | API données, config, auth — `server/` |
| server-executor.js | 3002 | Exécution IA locale — `electron/executor/` |

**Fonctionnalités incluses :**
- Auth (guard, interceptor, token localStorage)
- Pages : Home, Editor, Documents, Config, Deployments
- Admin : Users, Deployments, Help, Config
- Layout complet (header / nav / footer)
- Help drawer system
- Markdown editor réutilisable
- Tools : tchat-ia, ticket-widget, cahier-recette
- Workflow Claude (CLAUDE.md, histoModif, version, deploy-log)

---

## Créer un nouveau projet depuis ce template (Git Subtree)

```bash
# 1. Initialiser le nouveau projet
mkdir mon-projet && cd mon-projet
git init

# 2. Intégrer le template comme sous-dossier "base"
git subtree add --prefix=base https://github.com/worganic/worganic-base.git main --squash

# 3. Créer le code spécifique au projet à côté de base/
mkdir src
```

Structure résultante :
```
mon-projet/
  base/        ← stack de base (synchronisable)
  src/         ← code spécifique au projet
  package.json
```

---

## Mettre à jour un projet depuis le template

```bash
# Depuis le dossier du projet enfant
git subtree pull --prefix=base https://github.com/worganic/worganic-base.git main --squash
```

En cas de conflit : résoudre manuellement, puis `git commit`.

---

## Installation du template en local

### Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20+ |
| Angular CLI | 18+ (`npm install -g @angular/cli`) |
| Windows Terminal | — (pour `launch-frankenstein.bat`) |

### Installer les dépendances

```bash
install.bat
```

### Configurer les clés API

Éditer `data/config/conf.json` :

```json
{
  "apiKeys": {
    "gemini": { "key": "<votre-clé>", "active": true },
    "claude": { "key": "<votre-clé>",  "active": true }
  }
}
```

### Démarrer

```bash
launch-frankenstein.bat
```

---

## Workflow Claude Code

Ce projet inclut `CLAUDE.md` avec les règles de workflow IA (histoModif, versioning, git).

---

## Architecture child — Personnalisation sans toucher la base

Ce template intègre un système permettant à chaque **child project** de se personnaliser librement sans jamais modifier les fichiers partagés de la base. Lors d'une synchronisation base → child, seuls les fichiers "base" sont propagés. Les fichiers "child" ne sont jamais écrasés.

### Fichiers child-safe (jamais propagés, toujours dans le child)

| Fichier | Rôle | Exemple de valeur |
|---------|------|-------------------|
| `data/child/app.json` | Nom de l'app, logo, copyright | `{ "appName": "Mon Projet", "logoIcon": "bolt" }` |
| `data/child/theme.json` | Variables CSS custom (couleurs) | `{ "cssVars": { "--accent-color": "#22d3ee" } }` |
| `data/child/nav.json` | Items de navigation supplémentaires | `{ "items": [{ "route": "/projets", "label": "Projets", "icon": "folder" }] }` |
| `data/child/landing.json` | Textes de la page de connexion | `{ "heroTitleLine1": "Bienvenue sur", "heroTitleHighlight": "Mon Projet" }` |
| `data/child/home.json` | Home page après connexion | `{ "welcomeTitle": "Mon Projet", "primaryButtonRoute": "/projets" }` |
| `frankenstein/src/app/child/child-routes.ts` | Routes Angular exclusives au child | voir commentaires dans le fichier |
| `frankenstein/src/app/child/child-admin-tabs.ts` | Onglets admin exclusifs au child | voir commentaires dans le fichier |
| `frankenstein/src/app/pages/child/**` | Pages Angular exclusives au child | dossier libre |
| `frankenstein/src/environments/environment.ts` | URLs, appName Angular | `apiDataUrl`, `appName` |

### Créer un nouveau projet child

```
1. Dupliquer le dossier worganic-base → child--MON-PROJET
2. Modifier version.json :
   { "childId": "MON-V01", "child": "MON-0.01", "baseSynced": "B0.XX" }
3. Adapter data/child/app.json avec le branding du projet
4. sync-from-base.bat est déjà présent et fonctionnel (auto-détection depuis version.json)
5. Ajouter les routes child dans frankenstein/src/app/child/child-routes.ts
6. Ajouter les onglets admin child dans frankenstein/src/app/child/child-admin-tabs.ts
```

### Ajouter un item de navigation (child)

Éditer `data/child/nav.json` :
```json
{
  "items": [
    { "route": "/projets", "label": "Projets", "icon": "folder" },
    { "route": "/rapports", "label": "Rapports", "icon": "bar_chart" }
  ]
}
```

### Ajouter un onglet dans l'admin (child)

1. Créer le composant dans `frankenstein/src/app/pages/child/admin-mon-onglet/`
2. L'enregistrer dans `frankenstein/src/app/child/child-admin-tabs.ts` :

```typescript
import { MonOngletComponent } from '../pages/child/admin-mon-onglet/admin-mon-onglet.component';

const CHILD_ADMIN_TABS: AdminTabDef[] = [
  { id: 'mon-onglet', label: 'Mon Onglet', icon: 'folder', component: MonOngletComponent, order: 10 }
];
```

### Ajouter une page complète (child)

1. Créer le composant dans `frankenstein/src/app/pages/child/ma-page/`
2. Ajouter la route dans `frankenstein/src/app/child/child-routes.ts` :

```typescript
import { authGuard } from '../core/guards/auth.guard';
export const CHILD_ROUTES: Routes = [
  { path: 'ma-page', canActivate: [authGuard], loadComponent: () => import('../pages/child/ma-page/ma-page.component').then(m => m.MaPageComponent) }
];
```

### Personnaliser le thème graphique (child)

Éditer `data/child/theme.json` — les variables CSS sont appliquées au démarrage :
```json
{
  "cssVars": {
    "--color-light-primary": "14 116 144",
    "--color-light-secondary": "8 145 178",
    "--accent-color": "#06b6d4",
    "--bg-primary": "#0a0f12",
    "--bg-surface": "#0f1a1f"
  }
}
```

### Synchronisation base → child

Un fichier `sync-from-base.bat` est présent à la racine de chaque child. Il :
- Détecte automatiquement le `childId` depuis `version.json`
- Affiche les propagations en attente depuis `data/base-propagation.json`
- Met à jour le champ `baseSynced` dans `version.json`
- Affiche les commandes git/deploy-log pour finaliser

```
.\sync-from-base.bat
```
