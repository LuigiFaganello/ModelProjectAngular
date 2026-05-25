import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

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
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ---------------------------------------------------------------------------
// SSR — Angular
// ---------------------------------------------------------------------------

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
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

/**
 * Request handler used by the Angular CLI dev server (with-ssr) and during build.
 */
export const reqHandler = createNodeRequestHandler(app);
