# CLAUDE.md

Guidance for Claude Code (and any AI agent) when building **on top of this base**.

This repository is an **Angular 21 starter/base project** — it ships no business screens, only the
**folder structure, reusable infrastructure, and tooling** ready to go. When building a new project
from here, follow the conventions below: they define **where each kind of file belongs**, how to name
it, and which rules to respect.

> Golden rule: **do not invent new structure**. Every artifact has a canonical home described in
> [Where to create each file](#where-to-create-each-file). Create the feature/service/etc. there.

---

## Scripts (package.json)

| Script                  | Actual command                                      | What it does / when to use                                                                                  |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm start`             | `ng serve`                                          | **SPA** dev server (no SSR) at `http://localhost:4200`. Day-to-day work.                                    |
| `npm run start:ssr`     | `ng serve --configuration=with-ssr`                 | Dev server **with SSR** enabled. Use to validate server-side behavior during development.                   |
| `npm run build`         | `ng build`                                          | **Production SPA** build (optimization, hashing, budgets) into `dist/`. `defaultConfiguration: production`. |
| `npm run build:ssr`     | `ng build --configuration=production,with-ssr`      | **Production build WITH SSR** — emits the `browser/` and `server/` bundles. This is the SSR deploy build.   |
| `npm run watch`         | `ng build --watch --configuration development`      | Incremental rebuild (does not serve). For integrations that consume `dist/` continuously.                   |
| `npm run serve:ssr`     | `node dist/modelprojectangular/server/server.mjs`   | Runs the **already-built SSR server**. Requires `build:ssr` first. In production set `NG_ALLOWED_HOSTS`.    |
| `npm test`              | `ng test`                                           | **Vitest** in watch mode (jsdom, no browser). For TDD/development.                                          |
| `npm run test:headless` | `ng test --configuration=ci`                        | Vitest single-run + coverage + **100% gate**. This is what CI runs; use before pushing.                     |
| `npm run lint`          | `ng lint`                                           | ESLint 9 (flat config, **type-aware**).                                                                     |
| `npm run lint:fix`      | `ng lint --fix`                                     | ESLint with auto-fix.                                                                                       |
| `npm run format`        | `prettier --check "**/*.{ts,js,json,md,scss,html}"` | Checks formatting (CI). Fails if anything is off-style.                                                     |
| `npm run format:fix`    | `prettier --write …`                                | Applies formatting (includes Tailwind class sorting).                                                       |
| `npm run validate`      | `lint && format && test:headless`                   | **Local quality pipeline** — mirrors CI. Run before committing/opening a PR.                                |
| `npm run prepare`       | `husky`                                             | Installs git hooks. Runs automatically on `npm install`.                                                    |

> After changes, validate with **`npm run validate`**. To validate the SSR path, run `npm run build:ssr`.

Runtime requirements (`package.json` → `engines`): Node `^20.19.0 || ^22.12.0 || >=24.0.0`, npm `>=10`.
Version pinned in `.nvmrc` (`22.x`) — run `nvm use`.

---

## Folder structure

```
src/
├── app/
│   ├── core/                     # App-wide SINGLETON infra (loaded once). providedIn: 'root'.
│   │   ├── guards/               #   Route guards (CanActivateFn, CanMatchFn) and resolvers.
│   │   ├── handlers/             #   Global ErrorHandler and other app handlers.
│   │   ├── interceptors/         #   HttpInterceptorFn (auth, error, logging, ...).
│   │   ├── models/               #   DOMAIN interfaces/DTOs/enums used across the app.
│   │   └── services/             #   Singleton services (providedIn: 'root'): auth, api, storage, etc.
│   ├── layout/                   # SHELL components: header, footer, sidebar, main layout.
│   ├── shared/                   # REUSABLE and stateless. Importable by any feature/layout.
│   │   ├── components/           #   Presentational ("dumb") UI components: input/output only.
│   │   ├── directives/           #   Reusable directives.
│   │   ├── pipes/                #   Reusable pipes.
│   │   └── utils/                #   PURE functions (formatters, validators) — no Angular dependency.
│   ├── features/                 # Business DOMAINS. One folder per feature, lazy-loaded.
│   │   └── home/                 #   Example feature (placeholder).
│   ├── app.component.ts          # Root component (just <router-outlet>).
│   ├── app.config.ts             # CLIENT providers (zoneless, router, HTTP, hydration, ErrorHandler).
│   ├── app.config.server.ts      # Merges appConfig with SSR (provideServerRendering + withRoutes).
│   ├── app.routes.ts             # Application routes (lazy via loadComponent/loadChildren).
│   └── app.routes.server.ts      # Per-route RenderMode for SSR (Server | Prerender | Client).
├── environments/
│   ├── environment.model.ts      # EnvironmentConfig interface (source of truth — types both files).
│   ├── environment.ts            # Development values.
│   └── environment.production.ts # Production values (swapped via fileReplacements in the prod build).
├── main.ts                       # Client bootstrap.
├── main.server.ts                # Server bootstrap (receives and forwards the BootstrapContext).
├── server.ts                     # Express server (AngularNodeAppEngine) + security middleware.
├── index.html                    # Root HTML.
└── styles.scss                   # Global styles + Tailwind layers + design tokens.
```

Empty folders contain a `.gitkeep` — they are the skeleton; fill them in as the project grows.
**Do not use barrel files (`index.ts`)**: import directly from the file using the [path aliases](#path-aliases).

---

## Where to create each file

Use this table as a decision tree. "I want to create **X** → it goes in **Y** → named `Z`".

| I need…                                              | Folder                        | File name               | Exported symbol                         |
| ---------------------------------------------------- | ----------------------------- | ----------------------- | --------------------------------------- |
| A business **screen/page/domain**                    | `features/<name>/`            | `<name>.component.ts`   | `class XComponent` (standalone)         |
| A sub-component of a feature                         | `features/<name>/components/` | `<sub>.component.ts`    | `class SubComponent`                    |
| A service used by **one feature only**               | `features/<name>/services/`   | `<name>.service.ts`     | `class XService` (route-scoped)         |
| A **reusable** UI component (button, card, badge)    | `shared/components/`          | `<name>.component.ts`   | `class XComponent`                      |
| A reusable **directive**                             | `shared/directives/`          | `<name>.directive.ts`   | `class XDirective`                      |
| A reusable **pipe**                                  | `shared/pipes/`               | `<name>.pipe.ts`        | `class XPipe`                           |
| A **pure function** / helper (no Angular)            | `shared/utils/`               | `<name>.util.ts`        | `function x()`                          |
| A **singleton service** (auth, api, storage, logger) | `core/services/`              | `<name>.service.ts`     | `class XService` (`providedIn:'root'`)  |
| A **route guard** / resolver                         | `core/guards/`                | `<name>.guard.ts`       | `const xGuard: CanActivateFn`           |
| An **HTTP interceptor**                              | `core/interceptors/`          | `<name>.interceptor.ts` | `const xInterceptor: HttpInterceptorFn` |
| An **ErrorHandler** / global handler                 | `core/handlers/`              | `<name>.handler.ts`     | `class XHandler`                        |
| A domain **interface/DTO/enum** (global)             | `core/models/`                | `<name>.model.ts`       | `interface X` / `type X` / `enum X`     |
| A **shell** component (header, footer, sidebar)      | `layout/`                     | `<name>.component.ts`   | `class XComponent`                      |
| New **environment configuration**                    | `environments/`               | (edit the 3 files)      | see [Environments](#environments)       |

> Types/models specific to **one** component or feature live **next to** it (in the file itself or in
> a `models/` folder inside the feature), not in `core/models/`. `core/models/` is for global domain only.

---

## Layers and dependency rules

```
core      → singleton infra (no UI). MUST NOT import from shared, layout, or features.
shared    → reusable, stateless UI/logic. MUST NOT import from core, layout, or features.
layout    → app shell. MAY import from core and shared. MUST NOT import from features.
features  → business domains. MAY import from core and shared. NEVER from another feature or layout.
```

- **Cross-feature communication** goes through a service in `core/services/` (shared state), never via a
  direct import of one feature into another.
- `shared/` components are **presentational (dumb)**: they receive data via `input()` and emit via
  `output()`. They do not inject `core` services — this keeps `shared` pure and testable.

---

## Path aliases (tsconfig.json)

| Alias       | Resolves to          |
| ----------- | -------------------- |
| `@app/*`    | `src/app/*`          |
| `@core/*`   | `src/app/core/*`     |
| `@shared/*` | `src/app/shared/*`   |
| `@env/*`    | `src/environments/*` |

Always use aliases for cross-layer imports: `import { TokenService } from '@core/services/token.service'`.

---

## Naming conventions

- **Files**: `kebab-case` + type suffix: `user-profile.component.ts`, `auth.guard.ts`, `date.pipe.ts`.
  Each file has its `*.spec.ts` counterpart.
- **Classes**: `PascalCase` with suffix: `UserProfileComponent`, `TokenService`, `AuthGuard`.
- **Functions (guards/interceptors)**: `camelCase` with suffix: `authGuard`, `errorInterceptor`.
- **Component selectors**: `app-` + `kebab-case` (`app-user-profile`). **Directives**: `app` prefix in `camelCase`.
- **Signals/inputs/outputs**: descriptive names without a prefix (`label`, `clicked`, `isLoading`).

---

## Mandatory component patterns

The app is **zoneless** (`provideZonelessChangeDetection()`), with no `zone.js`. Consequences:

- **Every** component is `standalone` + `ChangeDetectionStrategy.OnPush`.
- Reactive state is **signal-based**. Do not use zone-dependent APIs to force CD
  (e.g. `setTimeout` to "refresh the view") — update a signal or call `markForCheck()`.

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    /* template dependencies */
  ],
  templateUrl: './example.component.html',
})
export class ExampleComponent {
  // Inputs/outputs via the signals API:
  label = input.required<string>();
  variant = input<'primary' | 'secondary'>('primary');
  clicked = output<void>();
  // Derived state with computed:
  upper = computed(() => this.label().toUpperCase());
}
```

Templates use the **new control flow** — never `*ngIf` / `*ngFor` / `*ngSwitch`:

```html
@for (item of items(); track item.id) { … } @if (isVisible()) { … } @else { … } @switch (status()) {
@case ('ok') { … } @default { … } }
```

---

## Recipes (how-to)

### Add a feature

1. Create `features/<name>/<name>.component.ts` (standalone, OnPush).
2. Register the route in `app.routes.ts` with **lazy loading**:
   ```typescript
   { path: '<name>', title: '<Title>', loadComponent: () =>
       import('./features/<name>/<name>.component').then((m) => m.XComponent) }
   ```
3. Feature with multiple routes: create `features/<name>/<name>.routes.ts` (exporting `Routes`) and use
   `loadChildren: () => import('./features/<name>/<name>.routes').then((m) => m.routes)`.
4. Write the `.spec.ts` (100% coverage).

### Add a guard

```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const token = inject(TokenService).getToken();
  return token ? true : inject(Router).createUrlTree(['/login']);
};
```

Register on the route: `canActivate: [authGuard]`.

### Add an interceptor

1. Create `core/interceptors/<name>.interceptor.ts` implementing `HttpInterceptorFn`.
2. Register in `app.config.ts`: `withInterceptors([authInterceptor, errorInterceptor, <new>])`.
3. **Order matters** — interceptors run left to right.

### Add a singleton service

```typescript
// core/services/example.service.ts
@Injectable({ providedIn: 'root' })
export class ExampleService {
  /* … */
}
```

Services with SSR-sensitive state (storage, etc.) must be **SSR-safe** — see `token.service.ts`
(uses `isPlatformBrowser(inject(PLATFORM_ID))`).

### Authentication (already wired)

1. On login, store the token: `inject(TokenService).setToken(token)`.
2. The `authInterceptor` injects `Authorization: Bearer <token>` on every request automatically.
3. On logout: `inject(TokenService).clearToken()`.

---

## Routing

- Routes live in `app.routes.ts`. Every feature is **lazy** (`loadComponent` or `loadChildren`).
- The `{ path: '**', redirectTo: '' }` wildcard requires a `path: ''` route declared **before** it.
- Set a `title` on each route (it becomes the page `<title>` — good for SEO).
- The router is already configured with `withComponentInputBinding()` (route params → `input()`),
  `withViewTransitions()`, and scroll restoration.

---

## SSR

Uses the current `@angular/ssr` API with `mergeApplicationConfig`:

- `app.config.ts` — client providers (router, animations, HTTP, hydration).
- `app.routes.server.ts` — `serverRoutes` with per-route `RenderMode` (`Server`, `Prerender`, or `Client`).
- `app.config.server.ts` — merges `appConfig` with `provideServerRendering(withRoutes(serverRoutes))`.
- `main.server.ts` — bootstrap that **receives and forwards the `BootstrapContext`** (required in Angular 21).
- `server.ts` — Express using `AngularNodeAppEngine` (`handle` + `writeResponseToNodeResponse`),
  exports `reqHandler` via `createNodeRequestHandler`.

To change a route's render mode, edit `app.routes.server.ts`. Build: `npm run build:ssr`.

---

## Testing

Runner: **Vitest** (builder `@angular/build:unit-test`, `vitest` runner) over **jsdom** — no browser.

- **100% coverage** required (statements, branches, functions, lines), via `coverageThresholds` in the
  `ci` configuration of the `test` target in `angular.json`. Every new file needs a `.spec.ts`.
- The gate only fires on `npm run test:headless` (the `ci` config); `npm test` (watch) passes despite gaps.
- Specs import from `vitest` (`import { describe, it, expect, vi } from 'vitest'`); mock with `vi.fn()`/`vi.spyOn()`.
  When spying on globals (e.g. `console`), restore with `vi.restoreAllMocks()` in `afterEach`.
- Inputs in specs: `fixture.componentRef.setInput('label', 'value')`.

### Zoneless mode in tests

With no `zone.js` in the test polyfills (`angular.json` → `test.options.polyfills: []`), `TestBed` runs **zoneless by default**:

- `fixture.detectChanges()` and `await fixture.whenStable()` work (manual CD).
- **Do not** use `fakeAsync`/`tick` (they depend on `zone.js`). For timers, use `vi.useFakeTimers()` / `vi.advanceTimersByTime()`.

---

## Environments

`angular.json` swaps `environment.ts` for `environment.production.ts` in the production build
(`fileReplacements`). Always access via the alias:

```typescript
import { environment } from '@env/environment';
```

When adding a config property, **declare it first** in the `EnvironmentConfig` interface
(`environment.model.ts`) — TypeScript then forces you to update both `environment.ts` and `environment.production.ts`.

---

## Security (Express server)

`server.ts` includes by default:

- **helmet** — security headers. CSP is disabled by default (SSR uses inline hydration scripts); configure per project.
- **CORS** — via `ALLOWED_ORIGINS`. In production without the variable, cross-origin is blocked.
- **Rate limiting** — `/api/*` limited to 100 req/IP per 15 minutes.

### Server environment variables

| Variable           | Default | Description                                                                                        |
| ------------------ | ------- | -------------------------------------------------------------------------------------------------- |
| `PORT`             | `4000`  | Express server port.                                                                               |
| `NODE_ENV`         | —       | `production` enables restrictive CORS.                                                             |
| `ALLOWED_ORIGINS`  | —       | Allowed CORS origins, e.g. `https://app.example.com` (comma-separated list).                       |
| `NG_ALLOWED_HOSTS` | —       | Allowed SSR hosts (`@angular/ssr` SSRF protection). Without it, undeclared hosts fall back to CSR. |

> **SSR + `NG_ALLOWED_HOSTS`**: `@angular/ssr` validates the request `Host` header (anti-SSRF). In production set
> `NG_ALLOWED_HOSTS=your-domain.com`; otherwise the server falls back to client-side rendering. To test the
> production bundle locally: `NG_ALLOWED_HOSTS=localhost`. `ng serve` (dev) does not need this.

---

## Quality & pre-commit

- **Husky + lint-staged** run on every commit: ESLint (`*.{ts,html}`) + Prettier (`*.{ts,html,js,scss,json,md}`).
- `prepare` installs the hooks on `npm install`. If they don't fire after cloning, run `npm install` again.
- Line endings are **LF** (enforced by `.gitattributes`, aligned with Prettier `endOfLine: lf`).
- Before pushing: **`npm run validate`**.
