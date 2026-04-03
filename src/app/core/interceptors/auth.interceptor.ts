import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '@core/services/token.service';

/**
 * HTTP interceptor that attaches a Bearer token to outgoing requests.
 *
 * When the user is authenticated, every request will carry an
 * `Authorization: Bearer <token>` header automatically.
 *
 * Usage: register via `withInterceptors([authInterceptor])` in app.config.ts.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (!token) {
    return next(req);
  }

  const authenticatedReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authenticatedReq);
};
