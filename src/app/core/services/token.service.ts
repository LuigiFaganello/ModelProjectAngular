import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * Manages the authentication token in browser storage.
 *
 * All methods are SSR-safe: they are no-ops on the server so that services
 * running during server-side rendering never throw a ReferenceError trying
 * to access `localStorage`.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'auth_token';

  /** Returns the stored token, or null when running server-side or unauthenticated. */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.storageKey);
  }

  /** Persists a token after a successful authentication response. No-op on the server. */
  setToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.storageKey, token);
  }

  /** Clears the token on logout or session expiry. No-op on the server. */
  clearToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.storageKey);
  }
}
