import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Modo de renderização por rota no servidor.
 *
 * - `Server`    → SSR sob demanda a cada request (padrão, bom para conteúdo dinâmico).
 * - `Prerender` → SSG em build time (ótimo para páginas estáticas / SEO).
 * - `Client`    → renderizado apenas no cliente (sem SSR).
 *
 * Ajuste por rota conforme a necessidade do projeto.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
