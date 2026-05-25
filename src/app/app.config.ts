import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { GlobalErrorHandler } from '@core/handlers/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    // Encaminha erros globais de window ('error'/'unhandledrejection') ao ErrorHandler.
    provideBrowserGlobalErrorListeners(),
    // Zoneless: dispensa zone.js. Toda a app é OnPush + signals.
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Liga parâmetros de rota (path/query/data) diretamente a inputs do componente.
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
