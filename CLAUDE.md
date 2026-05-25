# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Desenvolvimento
npm start                        # ng serve (config development) → SPA, sem SSR
npm run start:spa                # Idêntico ao start, com --configuration=development explícito
npm run start:ssr                # Dev server com SSR habilitado (--configuration=with-ssr)

# Build
npm run build                    # Build de produção (defaultConfiguration do builder)
npm run serve:ssr:modelprojectangular  # Roda o bundle SSR já buildado (node dist/.../server.mjs)

# Testes (Vitest em jsdom — sem browser)
npm test                         # ng test (Vitest em watch no terminal)
npm run test:headless            # Vitest single-run com cobertura + gate de 100% (config `ci`)

# Rodar um único spec
npx ng test --no-watch --include='**/nome.component.spec.ts'

# Lint e formatação
npm run lint:fix                 # ESLint com auto-fix via ng lint
npm run format:fix               # Prettier em todos os arquivos
```

> Requisitos de runtime (`package.json` → `engines`): Node `^20.19.0 || ^22.12.0 || >=24.0.0` e npm `>=10`.

## Arquitetura

### Camadas e regras de dependência

```
features/    → páginas e domínios de negócio, lazy loaded por rota
shared/      → componentes, pipes e diretivas genéricos e reutilizáveis
core/        → serviços singleton (providedIn: 'root'), guards, interceptors
```

- `features` pode importar de `shared` e `core`; features **nunca** se importam entre si
- `shared` não importa de `features` nem de `core`
- `core` não importa de `features` nem de `shared`

### Change detection

A aplicação é **zoneless** (`provideZonelessChangeDetection()` em `app.config.ts`) — não há `zone.js`. Por isso todo componente é `OnPush` e o estado reativo usa **signals**. Não use APIs que dependem de zone (ex.: `setTimeout` para forçar CD); atualize signals ou use `ChangeDetectorRef.markForCheck()`.

### SSR

O SSR usa a API atual do `@angular/ssr` com `mergeApplicationConfig`:

- `app.config.ts` — providers do cliente (router, animações, HTTP, hydration)
- `app.routes.server.ts` — `serverRoutes` definindo o `RenderMode` por rota (`Server`, `Prerender` ou `Client`)
- `app.config.server.ts` — faz merge do `appConfig` com `provideServerRendering(withRoutes(serverRoutes))`
- `main.server.ts` — exporta o bootstrap usando o config merged
- `server.ts` — servidor Express que usa `AngularNodeAppEngine` (`handle` + `writeResponseToNodeResponse`) e exporta `reqHandler` via `createNodeRequestHandler`

Para mudar o modo de renderização de uma rota, edite `app.routes.server.ts`. O build SSR usa a configuração `with-ssr` (`outputMode: "server"`).

### Roteamento

Todas as rotas usam lazy loading via `loadComponent`. O wildcard `{ path: '**', redirectTo: '' }` só funciona porque há uma rota `path: ''` definida antes dele. Ao adicionar features, registre sempre em `app.routes.ts` com `loadComponent`.

### Path aliases (tsconfig.json)

| Alias       | Resolução            |
| ----------- | -------------------- |
| `@app/*`    | `src/app/*`          |
| `@core/*`   | `src/app/core/*`     |
| `@shared/*` | `src/app/shared/*`   |
| `@env/*`    | `src/environments/*` |

Use sempre os aliases para imports entre camadas (ex: `@core/services/token.service`).

## Padrões obrigatórios para novos componentes

Todo componente deve ter:

```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...],
})
```

Inputs e outputs via API de signals:

```typescript
label = input.required<string>();
variant = input<'primary' | 'secondary'>('primary');
clicked = output<void>();
derived = computed(() => this.label().toUpperCase());
```

Templates usam o novo control flow — nunca `*ngIf` / `*ngFor`:

```html
@for (item of items(); track item.id) { ... } @if (isVisible()) { ... }
```

## Testes

O projeto exige **100% de cobertura** (statements, branches, functions, lines) — configurado na configuração `ci` do target `test` em `angular.json` (`coverageThresholds`). Todo novo componente precisa de spec completo.

> O gate de cobertura só dispara na configuração `ci` (que ativa `coverage` + `coverageThresholds`). Logo, **apenas `npm run test:headless` falha por cobertura insuficiente** — `npm test` (watch) passa mesmo com lacunas. Valide com `test:headless` antes de fazer push.

Para setar inputs em specs de componentes standalone:

```typescript
fixture.componentRef.setInput('label', 'valor');
```

### Testes em modo zoneless

Como não há `zone.js` nos polyfills de teste (`angular.json` → `test.options.polyfills: []`), o `TestBed` roda **zoneless por padrão**. Consequências:

- `fixture.detectChanges()` e `await fixture.whenStable()` continuam funcionando (CD manual).
- **Não** use `fakeAsync`/`tick` (dependem de `zone.js`). Para timers, use os fake timers do Vitest (`vi.useFakeTimers()` / `vi.advanceTimersByTime()`).
- Não é necessário adicionar `provideZonelessChangeDetection()` em cada `TestBed` — a ausência de `zone.js` já garante o modo zoneless.

## Environments

O `angular.json` substitui `environment.ts` por `environment.production.ts` no build de produção via `fileReplacements`. Acesse sempre via alias:

```typescript
import { environment } from '@env/environment';
```

## Camada Core

A pasta `core/` contém toda a infraestrutura singleton da aplicação. Estrutura atual:

```
core/
  guards/                     # Guards de rota (vazio — adicione conforme necessário)
  handlers/
    global-error.handler.ts   # ErrorHandler global (registrado em app.config.ts)
  interceptors/
    auth.interceptor.ts       # Adiciona Bearer token em cada requisição HTTP
    error.interceptor.ts      # Captura e loga todos os erros HTTP
  models/                     # Interfaces/DTOs de domínio (vazio)
  services/
    token.service.ts          # Lê/grava/limpa o JWT no localStorage (SSR-safe)
```

> As pastas `core/guards`, `core/models`, `shared/components`, `shared/pipes` e `shared/directives` vêm vazias (com `.gitkeep`) — são a estrutura base; preencha conforme o projeto cresce.

### Adicionando um guard

```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const token = inject(TokenService).getToken();
  return token ? true : inject(Router).createUrlTree(['/login']);
};
```

Registre em `app.routes.ts`: `canActivate: [authGuard]`.

### Adicionando um novo interceptor

1. Crie `core/interceptors/meu.interceptor.ts` implementando `HttpInterceptorFn`
2. Adicione ao array em `app.config.ts`: `withInterceptors([authInterceptor, errorInterceptor, meuInterceptor])`
3. A ordem importa — interceptors são executados da esquerda para a direita

### Autenticação

Ao implementar login:

1. Armazene o token via `TokenService.setToken(token)`
2. O `authInterceptor` já injeta o header `Authorization: Bearer <token>` automaticamente
3. No logout, chame `TokenService.clearToken()`

### Observabilidade

O `GlobalErrorHandler` tem um `TODO` para integração com serviços de monitoramento (Sentry, Datadog). Substitua o `console.error` pela chamada do SDK escolhido.

## Segurança (servidor Express)

O `server.ts` inclui por padrão:

- **helmet** — headers de segurança (X-Frame-Options, HSTS, etc.). CSP está desativado por padrão pois o Angular SSR usa scripts inline para hydration; configure por projeto
- **CORS** — controlado pela variável de ambiente `ALLOWED_ORIGINS` (lista separada por vírgula). Em produção sem a variável, bloqueia todas as origens cross-origin
- **Rate limiting** — `/api/*` limitado a 100 requisições por IP a cada 15 minutos

### Variáveis de ambiente do servidor

| Variável           | Padrão | Descrição                                                                                              |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| `PORT`             | `4000` | Porta do servidor Express                                                                              |
| `NODE_ENV`         | —      | `production` ativa CORS restritivo                                                                     |
| `ALLOWED_ORIGINS`  | —      | Origens permitidas no CORS, ex: `https://app.example.com`                                              |
| `NG_ALLOWED_HOSTS` | —      | Hosts permitidos no SSR (proteção SSRF do `@angular/ssr`). Sem isso, hosts não declarados caem em CSR. |

> **SSR + `NG_ALLOWED_HOSTS`:** o `@angular/ssr` valida o header `Host` da requisição como proteção contra SSRF. Em produção, defina `NG_ALLOWED_HOSTS=seu-dominio.com` (lista separada por vírgula); caso contrário o servidor faz fallback para client-side rendering. Para testar o bundle de produção localmente: `NG_ALLOWED_HOSTS=localhost`. O `ng serve` (dev) não precisa disso.

## Environments

O `angular.json` substitui `environment.ts` por `environment.production.ts` no build de produção via `fileReplacements`. Acesse sempre via alias:

```typescript
import { environment } from '@env/environment';
```

Ao adicionar novas propriedades de configuração, declare-as primeiro na interface `EnvironmentConfig` em `src/environments/environment.model.ts` — o TypeScript garantirá que ambos os arquivos de environment sejam atualizados.

## Pre-commit

O Husky executa `lint-staged` a cada commit. O `prepare` script (`"husky"`) instala os hooks automaticamente no `npm install`. Se os hooks não estiverem ativos após clonar, rode `npm install` novamente.
