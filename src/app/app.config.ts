import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tmdbAuthInterceptor } from './interceptors/tmdb-auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Or provideAnimations()

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
  provideHttpClient(withInterceptors([tmdbAuthInterceptor])),
  provideAnimationsAsync()
  ]
};
