import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------

/**
 * HTTP security headers via helmet.
 *
 * CSP is disabled here because Angular SSR injects inline scripts for
 * hydration. Configure it per-project when deploying:
 *   helmet({ contentSecurityPolicy: { directives: { ... } } })
 */
app.use(helmet({ contentSecurityPolicy: false }));

/**
 * CORS — configure allowed origins via the ALLOWED_ORIGINS environment
 * variable (comma-separated list). Falls back to wildcard in development
 * and blocks all cross-origin requests in production when not set.
 *
 * Example: ALLOWED_ORIGINS=https://app.example.com,https://api.example.com
 */
const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',').map((o) => o.trim());
const corsOptions: cors.CorsOptions = {
  origin:
    allowedOrigins ??
    (process.env['NODE_ENV'] === 'production'
      ? false // block cross-origin in production if not configured
      : '*'), // allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

/**
 * Rate limiting for API routes.
 * Adjust windowMs and max per the project's requirements.
 */
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ---------------------------------------------------------------------------
// Static files
// ---------------------------------------------------------------------------

/**
 * Serve static files from /browser.
 * Cache-busted files (hashed names) are served with a 1-year max-age.
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }),
);

// ---------------------------------------------------------------------------
// SSR — Angular Universal
// ---------------------------------------------------------------------------

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const rawPort = process.env['PORT'] ?? '4000';
  const port = parseInt(rawPort, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: "${rawPort}". Must be a number between 1 and 65535.`);
  }

  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
