/**
 * Shape of the environment configuration object.
 *
 * Both `environment.ts` and `environment.production.ts` must conform to this
 * interface. Add new properties here first so TypeScript enforces them in both
 * files at build time.
 */
export interface EnvironmentConfig {
  production: boolean;
  /** Base URL for all API requests (without trailing slash). */
  apiUrl: string;
}
