# Projeto Modelo Angular

> Base estruturada para novos projetos Angular, com SSR, Tailwind CSS, change detection zoneless e boas práticas de qualidade de código prontas para uso.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Arquitetura](#arquitetura)
- [Convenções de código](#convenções-de-código)
- [Testes](#testes)
- [Qualidade de código](#qualidade-de-código)
- [Tema e design system](#tema-e-design-system)
- [CI/CD](#cicd)

---

## Visão Geral

Este repositório é um **projeto modelo** que serve como ponto de partida para aplicações Angular. Ele encapsula decisões arquiteturais, configurações de ferramentas e padrões de código para que novos projetos comecem com qualidade desde o primeiro commit.

**O que já vem configurado:**

- Standalone components com roteamento lazy loading
- Change detection **zoneless** (sem `zone.js`) — toda a base em `OnPush` + signals
- Server-Side Rendering (SSR) com client hydration, event replay e `RenderMode` por rota
- Tailwind CSS com tema e design tokens customizados (classes ordenadas via Prettier)
- Angular CDK para primitivos de acessibilidade e comportamento
- ESLint 9 (flat config) com lint **type-aware** + Prettier
- Husky + lint-staged para qualidade garantida no pre-commit
- Vitest (jsdom, sem browser) com threshold de 100% de cobertura
- GitHub Actions com pipeline de lint, teste e build
- Path aliases configurados (`@app`, `@core`, `@shared`, `@env`)
- Arquivos de environment separados por configuração

---

## Stack

| Tecnologia          | Versão            | Função                                                                  |
| ------------------- | ----------------- | ----------------------------------------------------------------------- |
| Angular             | 21.x              | Framework principal — standalone components, signals, SSR, **zoneless** |
| Angular CDK         | 21.x              | Primitivos de acessibilidade e comportamento                            |
| TypeScript          | 5.9.x             | Tipagem estática — strict mode completo                                 |
| Tailwind CSS        | 3.x               | Utilitários de CSS com tema customizado                                 |
| RxJS                | 7.8.x             | Programação reativa                                                     |
| Express             | 4.x               | Servidor HTTP para SSR (`AngularNodeAppEngine`)                         |
| Vitest              | 4.x               | Testes unitários em jsdom (sem browser)                                 |
| ESLint              | 9.x (flat config) | Análise estática type-aware                                             |
| Prettier            | 3.x               | Formatação de código (+ ordenação de classes Tailwind)                  |
| Husky + lint-staged | 9.x / 15.x        | Hooks de Git para qualidade no pre-commit                               |

---

## Pré-requisitos

- **Node.js** `^20.19.0 || ^22.12.0 || >=24.0.0` (recomendado: `22.x` — definido em `.nvmrc`)
- **npm** `>=10`

Se você usa [nvm](https://github.com/nvm-sh/nvm), basta rodar na raiz do projeto:

```bash
nvm use
```

---

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd modelprojectangular

# Instalar dependências
# O script `prepare` configura o Husky automaticamente após o install
npm install
```

---

## Scripts disponíveis

### Desenvolvimento

| Script              | Descrição                                          |
| ------------------- | -------------------------------------------------- |
| `npm start`         | Dev server em modo SPA (sem SSR), `localhost:4200` |
| `npm run start:ssr` | Dev server com SSR habilitado                      |
| `npm run watch`     | Rebuild incremental em modo desenvolvimento        |

### Build

| Script              | Descrição                                                |
| ------------------- | -------------------------------------------------------- |
| `npm run build`     | Build de produção SPA                                    |
| `npm run build:ssr` | Build de produção **com SSR** (bundles browser + server) |
| `npm run serve:ssr` | Roda o servidor SSR já buildado (requer `build:ssr`)     |

### Testes

| Script                  | Descrição                                                               |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm test`              | Executa os testes (Vitest) em modo watch no terminal                    |
| `npm run test:headless` | Executa os testes em single-run com cobertura + gate 100% (usado no CI) |

### Qualidade

| Script               | Descrição                                                      |
| -------------------- | -------------------------------------------------------------- |
| `npm run lint`       | Analisa o código com ESLint                                    |
| `npm run lint:fix`   | Corrige automaticamente os problemas de lint                   |
| `npm run format`     | Verifica a formatação com Prettier                             |
| `npm run format:fix` | Aplica a formatação com Prettier                               |
| `npm run validate`   | Pipeline de qualidade local: lint + format + testes (CI local) |

---

## Estrutura do projeto

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline de CI (lint → test → build)
├── .husky/
│   └── pre-commit              # Hook: lint-staged nos arquivos alterados
├── .vscode/                    # Configurações e extensões recomendadas
├── public/                     # Assets estáticos (favicon, etc.)
├── src/
│   ├── app/
│   │   ├── core/                 # Infra singleton (providedIn: 'root')
│   │   │   ├── guards/           # Guards/resolvers de rota (vazio — .gitkeep)
│   │   │   ├── handlers/         # GlobalErrorHandler
│   │   │   ├── interceptors/     # auth + error (HTTP)
│   │   │   ├── models/           # Interfaces/DTOs de domínio (vazio — .gitkeep)
│   │   │   └── services/         # TokenService (SSR-safe)
│   │   ├── layout/               # Componentes de shell: header/footer/sidebar (vazio — .gitkeep)
│   │   ├── shared/               # Reutilizáveis, stateless e genéricos
│   │   │   ├── components/       # Componentes de UI apresentacionais (vazio — .gitkeep)
│   │   │   ├── directives/       # (vazio — .gitkeep)
│   │   │   ├── pipes/            # (vazio — .gitkeep)
│   │   │   └── utils/            # Funções puras/helpers (vazio — .gitkeep)
│   │   ├── features/             # Domínios de negócio (lazy loaded)
│   │   │   └── home/             # Página placeholder
│   │   ├── app.component.ts      # Componente raiz com <router-outlet>
│   │   ├── app.config.ts         # Providers do cliente (zoneless, router, HTTP, hydration)
│   │   ├── app.config.server.ts  # Merge do appConfig com SSR (withRoutes)
│   │   ├── app.routes.ts         # Rotas com lazy loading
│   │   └── app.routes.server.ts  # RenderMode por rota (SSR)
│   ├── environments/
│   │   ├── environment.ts        # Ambiente de desenvolvimento
│   │   └── environment.production.ts
│   ├── main.ts                   # Bootstrap do cliente
│   ├── main.server.ts            # Bootstrap do servidor SSR
│   ├── server.ts                 # Servidor Express (AngularNodeAppEngine)
│   └── styles.scss               # Estilos globais + Tailwind layers
├── angular.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Arquitetura

### Camadas da aplicação

```
features/          → Páginas e domínios de negócio (lazy loaded por rota)
layout/            → Componentes de shell: header, footer, sidebar
shared/components/ → Componentes de UI genéricos e reutilizáveis (apresentacionais)
shared/directives/ → Diretivas reutilizáveis
shared/pipes/      → Pipes reutilizáveis
shared/utils/      → Funções puras/helpers (sem dependência de Angular)
core/services/     → Serviços singleton injetados na raiz
core/guards/       → Guards/resolvers de rota
core/interceptors/ → Interceptors HTTP
core/handlers/     → ErrorHandler global e afins
core/models/       → Interfaces/DTOs de domínio (globais)
```

> A documentação completa de **o que vai em cada pasta** e o guia "onde criar cada arquivo"
> estão no [`CLAUDE.md`](./CLAUDE.md), que é a referência para desenvolvimento assistido por IA.

### Regras de dependência

- `features` pode importar de `shared` e `core`; **nunca** de outra feature nem de `layout`
- `layout` pode importar de `shared` e `core`; **nunca** de `features`
- `shared` **não pode** importar de `features`, `layout` nem de `core`
- `core` **não pode** importar de `features` nem de `shared`
- Comunicação entre features deve ser feita via serviço em `core`

### Path aliases

Use os aliases configurados no `tsconfig.json` para evitar caminhos relativos longos:

| Alias       | Resolução            |
| ----------- | -------------------- |
| `@app/*`    | `src/app/*`          |
| `@core/*`   | `src/app/core/*`     |
| `@shared/*` | `src/app/shared/*`   |
| `@env/*`    | `src/environments/*` |

```typescript
// Evite
import { TokenService } from '../../../core/services/token.service';

// Prefira
import { TokenService } from '@core/services/token.service';
```

### Adicionando uma nova feature

```bash
# Componentes standalone são o padrão no Angular 21 (a pasta é criada pelo CLI)
ng generate component features/minha-feature/minha-feature
```

Registre a rota em `app.routes.ts` usando lazy loading:

```typescript
{
  path: 'minha-feature',
  loadComponent: () =>
    import('./features/minha-feature/minha-feature.component')
      .then((m) => m.MinhaFeatureComponent),
}
```

---

## Convenções de código

### Componentes

- Sempre `standalone: true`
- Sempre `ChangeDetectionStrategy.OnPush`
- Inputs usando a API de signals: `input()` e `input.required<T>()`
- Outputs usando a API de signals: `output<T>()`
- Computed values com `computed()` em vez de getters puros quando há derivação de signals

```typescript
@Component({
  selector: 'app-exemplo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `<p>{{ label() }}</p>`,
})
export class ExemploComponent {
  label = input.required<string>();
}
```

### Templates

- Usar o novo control flow (`@if`, `@for`, `@switch`) em vez de `*ngIf` e `*ngFor`
- Sempre incluir `track` no `@for`

```html
@for (item of items(); track item.id) {
<app-card [data]="item" />
} @if (isLoading()) {
<app-spinner />
}
```

### Serviços

- Usar `providedIn: 'root'` para serviços singleton
- Expor estado reativo via `signal()` ou `BehaviorSubject` / `Observable`

---

## Testes

Os testes rodam em **Vitest** (builder `@angular/build:unit-test`) sobre **jsdom** — sem browser, em segundos.

### Execução

```bash
# Watch no terminal (desenvolvimento)
npm test

# Single-run com cobertura + gate de 100% (CI)
npm run test:headless
```

O relatório de cobertura HTML é gerado em `coverage/`.

### Thresholds

O projeto exige **100% de cobertura** em statements, branches, functions e lines. Configurado na configuração `ci` do target `test` (`angular.json`):

```jsonc
"coverageThresholds": {
  "statements": 100,
  "branches": 100,
  "functions": 100,
  "lines": 100
}
```

### Padrões para specs

- Importar utilitários de teste do `vitest` (`describe`, `it`, `expect`, `vi`, ...)
- Usar `vi.fn()` / `vi.spyOn()` para mocks (e `vi.restoreAllMocks()` em `afterEach` ao espionar globais como `console`)
- Usar `fixture.componentRef.setInput()` para definir inputs em testes
- Descrever em português para consistência com o restante dos testes

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

describe('MeuComponent', () => {
  let fixture: ComponentFixture<MeuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeuComponent);
    fixture.componentRef.setInput('title', 'Teste');
  });

  it('deve criar o componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## Qualidade de código

### Lint e formatação

O ESLint usa **flat config** (`eslint.config.js`, ESLint 9) com o pacote unificado `angular-eslint` e lint **type-aware**:

- `typescript-eslint` `recommendedTypeChecked` + `stylistic` — regras que usam o type checker
- `angular-eslint` `tsRecommended` + `templateRecommended` + `templateAccessibility`
- `@angular-eslint/template/eqeqeq` — força `===` nos templates
- `eslint-config-prettier` — desabilita regras de formatação que conflitam com o Prettier
- specs (`*.spec.ts`) relaxam as regras `no-unsafe-*` para facilitar mocks/stubs

O Prettier é configurado via `.prettierrc.json` (com `prettier-plugin-tailwindcss` para ordenar classes):

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Pre-commit (Husky + lint-staged)

A cada `git commit`, o lint-staged executa automaticamente sobre os arquivos staged:

| Arquivo                    | Ação                                 |
| -------------------------- | ------------------------------------ |
| `*.ts`, `*.html`           | `ng lint --fix` + `prettier --write` |
| `*.scss`, `*.json`, `*.md` | `prettier --write`                   |

---

## Tema e design system

### Paleta de cores (Tailwind)

| Token       | Cor base  | Uso sugerido                        |
| ----------- | --------- | ----------------------------------- |
| `primary`   | `#2486ff` | Ações principais, botões, links     |
| `secondary` | `#3d5f9c` | Textos, bordas, backgrounds neutros |
| `accent`    | `#f97316` | Destaques, badges, alertas          |

Cada cor possui escala completa de `50` a `950` acessível via Tailwind:

```html
<div class="bg-primary-500 text-primary-50">...</div>
<div class="border-secondary-200 text-secondary-700">...</div>
```

### CSS custom properties (design tokens)

Disponíveis globalmente em `styles.scss`:

| Variável                | Valor padrão                    |
| ----------------------- | ------------------------------- |
| `--color-bg`            | `theme('colors.secondary.50')`  |
| `--color-text`          | `theme('colors.secondary.900')` |
| `--color-primary`       | `theme('colors.primary.500')`   |
| `--color-primary-hover` | `theme('colors.primary.600')`   |

### Fontes

| Fonte                | Uso                                      |
| -------------------- | ---------------------------------------- |
| **Inter Variable**   | Interface geral — corpo de texto, labels |
| **Raleway Variable** | Títulos e destaques tipográficos         |

### Utilitários CSS customizados

```html
<!-- Botão primário padrão do projeto -->
<button class="btn-primary">Ação</button>
```

---

## CI/CD

O pipeline do GitHub Actions (`.github/workflows/ci.yml`) é acionado em push e pull requests para `main`.

```
push / PR → main
        │
        ├── lint   (ESLint + Prettier check)
        │
        ├── test   (Vitest + gate 100% + upload cobertura)
        │
        └── build  (ng build --configuration production)  ← só roda se lint e test passarem
```

Artefatos gerados por execução:

- `coverage/` — relatório de cobertura (retido por 7 dias)
- `dist/` — build de produção (retido por 7 dias)
