# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Desenvolvimento
npm start                        # SPA mode (sem SSR)
npm run start:ssr                # Com SSR habilitado

# Build
npm run build                    # Build de produção

# Testes
npm test                         # Watch mode com UI no browser
npm run test:headless            # Headless com cobertura (usado no CI)

# Rodar um único spec
npx ng test --watch=false --include='**/nome.component.spec.ts'

# Lint e formatação
npm run lint:fix                 # ESLint com auto-fix via ng lint
npm run format:fix               # Prettier em todos os arquivos
```

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

| Alias | Resolução |
|---|---|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@env/*` | `src/environments/*` |

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
@for (item of items(); track item.id) { ... }
@if (isVisible()) { ... }
```

## Testes

O projeto exige **100% de cobertura** (statements, branches, functions, lines) — configurado em `karma.conf.cjs`. Todo novo componente precisa de spec completo.

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

## Pre-commit

O Husky executa `lint-staged` a cada commit. O `prepare` script (`"husky"`) instala os hooks automaticamente no `npm install`. Se os hooks não estiverem ativos após clonar, rode `npm install` novamente.
