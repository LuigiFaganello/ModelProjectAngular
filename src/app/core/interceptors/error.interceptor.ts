import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP interceptor for centralised error handling.
 *
 * Logs all HTTP errors and re-throws them so individual call sites can still
 * react to specific status codes when needed. Non-HTTP errors (e.g. JavaScript
 * exceptions thrown inside a pipe) are re-thrown without logging.
 *
 * Extend this interceptor with application-specific behaviour, for example:
 *   - 401 → clear token and redirect to /login
 *   - 403 → show "no permission" notification
 *   - 503 → show maintenance page
 *
 * Usage: register via `withInterceptors([errorInterceptor])` in app.config.ts.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const message: string = (error.error as { message?: string })?.message ?? error.message;
      console.error(`[HTTP ${error.status}] ${req.method} ${req.urlWithParams} — ${message}`);

      return throwError(() => error);
    }),
  );
};
