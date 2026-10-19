import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {providePrimeNG} from 'primeng/config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import Aura from '@primeuix/themes/aura';

import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation
} from '@azure/msal-browser';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService, MsalModule
} from '@azure/msal-angular';
import { msalConfig } from './auth-config'; // Pointing to the config file you created earlier

// 1. Initialize the MSAL Instance
export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '1d2796fb-6f52-4590-b6be-c22dbba8e30a',
      authority: 'https://login.microsoftonline.com/aafea113-8a60-476f-97e1-f518d6cd5db0',
      redirectUri: 'http://localhost:4200'
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
    // --- MSAL Module Configuratie (Vervangt de losse providers) ---
    importProvidersFrom(
      MsalModule.forRoot(
        new PublicClientApplication(msalConfig),
        {
          // Guard configuratie
          interactionType: InteractionType.Redirect,
          authRequest: {
            scopes: ['user.read']
          }
        },
        {
          // Interceptor configuratie (optioneel voor later als je API's aanroept)
          interactionType: InteractionType.Redirect,
          protectedResourceMap: new Map([
            ['https://graph.microsoft.com/v1.0/me', ['user.read']]
          ])
        }
      )
    ),
    MsalService,
    MsalGuard,
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['http://localhost:8080/api/', ['api://YOUR_SPRING_BOOT_CLIENT_ID/access_as_user']]
        ])
      }
    },
    MsalBroadcastService
  ]
};
