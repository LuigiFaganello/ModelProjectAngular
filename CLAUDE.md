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

# Testes
npm test                         # ng test (watch interativo no browser)
npm run test:headless            # Headless com cobertura — único modo que dispara o gate de 100% (CI)

# Rodar um único spec
npx ng test --watch=false --include='**/nome.component.spec.ts'

# Lint e formatação
npm run lint:fix                 # ESLint com auto-fix via ng lint
npm run format:fix               # Prettier em todos os arquivos
```

> Requisitos de runtime (`package.json` → `engines`): Node `>=18.19.0 <19 || >=20.5.0` e npm `>=10`.

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

### SSR

O SSR usa o padrão `mergeApplicationConfig`:

- `app.config.ts` — providers do cliente (router, animações, HTTP, hydration)
- `app.config.server.ts` — faz merge do `appConfig` com `provideServerRendering()`
- `main.server.ts` — exporta o bootstrap usando o config merged
- `server.ts` — servidor Express que serve o bundle SSR

### Roteamento

Todas as rotas usam lazy loading via `loadComponent`. O wildcard `{ path: '**', redirectTo: '' }` só funciona porque há uma rota `path: ''` definida antes dele. Ao adicionar features, registre sempre em `app.routes.ts` com `loadComponent`.

### Path aliases (tsconfig.json)

| Alias       | Resolução            |
| ----------- | -------------------- |
| `@app/*`    | `src/app/*`          |
| `@core/*`   | `src/app/core/*`     |
| `@shared/*` | `src/app/shared/*`   |
| `@env/*`    | `src/environments/*` |

Use sempre os aliases para imports entre camadas (ex: `@shared/components/badge/badge.component`).

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

O projeto exige **100% de cobertura** (statements, branches, functions, lines) — configurado em `karma.conf.cjs` (`coverageReporter.check.global`). Todo novo componente precisa de spec completo.

> O gate de cobertura só dispara quando a cobertura é coletada (`--code-coverage`). Logo, **apenas `npm run test:headless` falha por cobertura insuficiente** — `npm test` passa mesmo com lacunas. Valide com `test:headless` antes de fazer push. Os specs rodam em ordem determinística (`jasmine.random: false`).

Para setar inputs em specs de componentes standalone:

```typescript
fixture.componentRef.setInput('label', 'valor');
```

O `src/test-setup.ts` stuba o `MatIconRegistry` para evitar erros de ícones nos testes. Já é carregado automaticamente via `polyfills` no `angular.json`.

## Environments

O `angular.json` substitui `environment.ts` por `environment.production.ts` no build de produção via `fileReplacements`. Acesse sempre via alias:

```typescript
import { environment } from '@env/environment';
```

## Camada Core

A pasta `core/` contém toda a infraestrutura singleton da aplicação. Estrutura atual:

```
core/
  handlers/
    global-error.handler.ts   # ErrorHandler global (registrado em app.config.ts)
  interceptors/
    auth.interceptor.ts       # Adiciona Bearer token em cada requisição HTTP
    error.interceptor.ts      # Captura e loga todos os erros HTTP
  services/
    token.service.ts          # Lê/grava/limpa o JWT no localStorage (SSR-safe)
```

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

| Variável          | Padrão | Descrição                                         |
| ----------------- | ------ | ------------------------------------------------- |
| `PORT`            | `4000` | Porta do servidor Express                         |
| `NODE_ENV`        | —      | `production` ativa CORS restritivo                |
| `ALLOWED_ORIGINS` | —      | Origens permitidas, ex: `https://app.example.com` |

## Environments

O `angular.json` substitui `environment.ts` por `environment.production.ts` no build de produção via `fileReplacements`. Acesse sempre via alias:

```typescript
import { environment } from '@env/environment';
```

Ao adicionar novas propriedades de configuração, declare-as primeiro na interface `EnvironmentConfig` em `src/environments/environment.model.ts` — o TypeScript garantirá que ambos os arquivos de environment sejam atualizados.

## Pre-commit

O Husky executa `lint-staged` a cada commit. O `prepare` script (`"husky"`) instala os hooks automaticamente no `npm install`. Se os hooks não estiverem ativos após clonar, rode `npm install` novamente.
