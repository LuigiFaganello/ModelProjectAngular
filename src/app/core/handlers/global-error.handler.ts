import { ErrorHandler, Injectable } from '@angular/core';

/**
 * Global error handler for uncaught Angular errors.
 *
 * Replaces Angular's default ErrorHandler and provides a single place to:
 *   - Log errors to an observability service (Sentry, Datadog, etc.)
 *   - Show user-facing notifications
 *   - Track client-side errors in production
 *
 * Usage: register via `{ provide: ErrorHandler, useClass: GlobalErrorHandler }`
 * in app.config.ts.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // TODO: integrate with your observability service here
    // e.g. Sentry.captureException(error);
    console.error('[GlobalErrorHandler]', error);
  }
}
