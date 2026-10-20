import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';

import {
  PublicClientApplication,
  InteractionType
} from '@azure/msal-browser';
import {
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService, MsalModule, MsalInterceptor
} from '@azure/msal-angular';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import {environment} from '../environments/environment';
import {ajaxBusyInterceptor} from '../interceptor/ajax-busy-interceptor'; // Pointing to the config file you created earlier

// 1. Initialize the MSAL Instance
export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.clientId,
      authority: environment.authority,
      redirectUri: environment.redirectUri
    }
  });
}

// 2. (Optional) Configure Guard to protect specific routes
export function MSALGuardConfigFactory() {
  return {
    interactionType: InteractionType.Redirect, // or InteractionType.Popup
    authRequest: {
      scopes: ['user.read'] // Add any default scopes your app needs on login
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([ajaxBusyInterceptor]) // <--- 2. Registreer functionele interceptors hier
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor, // MsalInterceptor blijft via DI / HTTP_INTERCEPTORS werken
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark' // optional
        }
      }
    }),
    // --- CRITICAL: Bind your MSAL instance factory here ---
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService,
    MsalGuard,
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          [environment.apiUrl, [environment.scopes]]
        ])
      }
    },
    MsalBroadcastService
  ]
};
