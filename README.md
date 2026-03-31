# Projeto Modelo Angular

> Base estruturada para novos projetos Angular, com SSR, Tailwind CSS, Angular Material e boas práticas de qualidade de código prontas para uso.

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
- Server-Side Rendering (SSR) com client hydration e event replay
- Tailwind CSS com tema e design tokens customizados
- Angular Material integrado e com animações assíncronas
- ESLint + Prettier com regras para TypeScript e templates Angular
- Husky + lint-staged para qualidade garantida no pre-commit
- Karma + Jasmine com threshold de 100% de cobertura
- GitHub Actions com pipeline de lint, teste e build
- Path aliases configurados (`@app`, `@core`, `@shared`, `@env`)
- Arquivos de environment separados por configuração

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Angular | 21.x | Framework principal — standalone components, signals, SSR |
| Angular Material | 21.x | Biblioteca de componentes de UI |
| Angular CDK | 21.x | Primitivos de acessibilidade e comportamento |
| TypeScript | 5.9.x | Tipagem estática — strict mode completo |
| Tailwind CSS | 3.x | Utilitários de CSS com tema customizado |
| RxJS | 7.8.x | Programação reativa |
| Express | 4.x | Servidor HTTP para SSR |
| Karma + Jasmine | 6.x / 5.x | Testes unitários com Chrome Headless |
| ESLint | 8.x | Análise estática de código |
| Prettier | 3.x | Formatação de código |
| Husky + lint-staged | 9.x / 15.x | Hooks de Git para qualidade no pre-commit |

---

## Pré-requisitos

- **Node.js** `>=18.19.0` (recomendado: `22.x` — definido em `.nvmrc`)
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

| Script | Descrição |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento (modo SPA) |
| `npm run start:spa` | Inicia explicitamente no modo SPA sem SSR |
| `npm run start:ssr` | Inicia com SSR habilitado |
| `npm run watch` | Build contínuo em modo desenvolvimento |

### Build

| Script | Descrição |
|---|---|
| `npm run build` | Build de produção completo |
| `npm run serve:ssr:modelprojectangular` | Serve o build SSR gerado |

### Testes

| Script | Descrição |
|---|---|
| `npm test` | Executa os testes em modo watch com interface HTML |
| `npm run test:headless` | Executa os testes headless com relatório de cobertura (usado no CI) |

### Qualidade

| Script | Descrição |
|---|---|
| `npm run lint` | Analisa o código com ESLint |
| `npm run lint:fix` | Corrige automaticamente os problemas de lint |
| `npm run format` | Verifica a formatação com Prettier |
| `npm run format:fix` | Aplica a formatação com Prettier |

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
│   │   ├── core/               # Serviços singleton, guards, interceptors HTTP
│   │   ├── shared/
│   │   │   └── components/     # Componentes, pipes e diretivas reutilizáveis
│   │   │       ├── badge/
│   │   │       └── tech-card/
│   │   ├── features/           # Funcionalidades do domínio (lazy loaded)
│   │   │   └── home/
│   │   ├── app.component.ts    # Componente raiz com <router-outlet>
│   │   ├── app.config.ts       # Providers do cliente (animações, HTTP, router)
│   │   ├── app.config.server.ts# Merge do appConfig com providers de SSR
│   │   └── app.routes.ts       # Definição de rotas com lazy loading
│   ├── environments/
│   │   ├── environment.ts      # Variáveis de ambiente para desenvolvimento
│   │   └── environment.production.ts
│   ├── main.ts                 # Bootstrap do cliente
│   ├── main.server.ts          # Bootstrap do servidor SSR
│   ├── server.ts               # Servidor Express para SSR
│   ├── styles.scss             # Estilos globais + Tailwind layers
│   └── test-setup.ts           # Setup global dos testes (stub MatIconRegistry)
├── angular.json
├── karma.conf.cjs
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Arquitetura

### Camadas da aplicação

```
features/          → Páginas e domínios de negócio (lazy loaded por rota)
shared/components/ → Componentes de UI genéricos e reutilizáveis
shared/pipes/      → Pipes reutilizáveis (a criar conforme necessidade)
shared/directives/ → Diretivas reutilizáveis (a criar conforme necessidade)
core/services/     → Serviços singleton injetados na raiz
core/guards/       → Guards de rota
core/interceptors/ → Interceptors HTTP
```

### Regras de dependência

- `features` pode importar de `shared` e `core`, **nunca** entre features diretamente
- `shared` **não pode** importar de `features` nem de `core`
- `core` **não pode** importar de `features` nem de `shared`
- Comunicação entre features deve ser feita via serviço em `core`

### Path aliases

Use os aliases configurados no `tsconfig.json` para evitar caminhos relativos longos:

| Alias | Resolução |
|---|---|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@env/*` | `src/environments/*` |

```typescript
// Evite
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

// Prefira
import { BadgeComponent } from '@shared/components/badge/badge.component';
```

### Adicionando uma nova feature

```bash
# Crie a pasta da feature
mkdir -p src/app/features/minha-feature

# Crie o componente standalone
ng generate component features/minha-feature/minha-feature --standalone
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
}

@if (isLoading()) {
  <app-spinner />
}
```

### Serviços

- Usar `providedIn: 'root'` para serviços singleton
- Expor estado reativo via `signal()` ou `BehaviorSubject` / `Observable`

---

## Testes

### Execução

```bash
# Watch mode com UI no browser (desenvolvimento)
npm test

# Headless com cobertura (CI / pre-push)
npm run test:headless
```

O relatório de cobertura HTML é gerado em `coverage/modelprojectangular/index.html`.

### Thresholds

O projeto exige **100% de cobertura** em statements, branches, functions e lines. Configurado em `karma.conf.cjs`:

```js
thresholds: {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
}
```

### Padrões para specs

- Usar `fixture.componentRef.setInput()` para definir inputs em testes
- Descrever em português para consistência com o restante dos testes
- Um `describe` por componente/serviço, com `beforeEach` configurando o `TestBed`

```typescript
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

O ESLint é configurado via `.eslintrc.cjs` com as seguintes regras principais:

- `@angular-eslint/recommended` — boas práticas Angular
- `@typescript-eslint/recommended` — boas práticas TypeScript
- `@angular-eslint/template/eqeqeq` — força `===` nos templates
- `prettier` — desabilita regras de formatação que conflitam com o Prettier

O Prettier é configurado via `.prettierrc.json`:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "endOfLine": "lf"
}
```

### Pre-commit (Husky + lint-staged)

A cada `git commit`, o lint-staged executa automaticamente sobre os arquivos staged:

| Arquivo | Ação |
|---|---|
| `*.ts`, `*.html` | `ng lint --fix` + `prettier --write` |
| `*.scss`, `*.json`, `*.md` | `prettier --write` |

---

## Tema e design system

### Paleta de cores (Tailwind)

| Token | Cor base | Uso sugerido |
|---|---|---|
| `primary` | `#2486ff` | Ações principais, botões, links |
| `secondary` | `#3d5f9c` | Textos, bordas, backgrounds neutros |
| `accent` | `#f97316` | Destaques, badges, alertas |

Cada cor possui escala completa de `50` a `950` acessível via Tailwind:

```html
<div class="bg-primary-500 text-primary-50">...</div>
<div class="border-secondary-200 text-secondary-700">...</div>
```

### CSS custom properties (design tokens)

Disponíveis globalmente em `styles.scss`:

| Variável | Valor padrão |
|---|---|
| `--color-bg` | `theme('colors.secondary.50')` |
| `--color-text` | `theme('colors.secondary.900')` |
| `--color-primary` | `theme('colors.primary.500')` |
| `--color-primary-hover` | `theme('colors.primary.600')` |

### Fontes

| Fonte | Uso |
|---|---|
| **Inter Variable** | Interface geral — corpo de texto, labels |
| **Raleway Variable** | Títulos e destaques tipográficos |

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
        ├── test   (Karma headless + upload cobertura)
        │
        └── build  (ng build --configuration production)  ← só roda se lint e test passarem
```

Artefatos gerados por execução:

- `coverage/` — relatório de cobertura (retido por 7 dias)
- `dist/` — build de produção (retido por 7 dias)
