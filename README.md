# Project for testing Azure entra-id


## Features
- implementing ajax spinner
- implementing

## OAuth 2.0 en OpenID Connect (OIDC). implementation
#### app.config.ts
```typescript
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

```


## Ajax implementation
### Purpose
To show spinner with slow rest api call, to let the user now.
That the api has some startup or latensie problems

#### The interceptor implementation(ajax-busy-interceptor.ts)
``` typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import {AjaxBusyService} from '../services/ajax/ajax-busy-service';


export const ajaxBusyInterceptor: HttpInterceptorFn = (req, next) => {
  // Use inject() to get the service instance
  const busyService = inject(AjaxBusyService);

  busyService.beginRequest(); // Start the busy state logic

  // Handle the request and ensure endRequest is called on success/failure/cancellation
  return next(req).pipe(
    finalize(() => {
      busyService.endRequest(); // End the busy state logic
    })
  );
};
```

#### The spinner service implementation(spinner-service.ts)
``` typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

   // Private Subject for emission (best practice)
  private readonly spinnerSubject = new BehaviorSubject<boolean>(false);

  // Public Observable for consumption
  public spinnerObservable: Observable<boolean> = this.spinnerSubject.asObservable();

  constructor() { }

  show(): void {
    console.log('SpinnerService: SETTING TRUE (Emitted)');
    this.spinnerSubject.next(true); 
  }

  hide(): void {
    console.log('SpinnerService: SETTING FALSE (Emitted)');
    this.spinnerSubject.next(false);
  }


}
```

#### ApplicationConfig(app.config.ts)
``` typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([ajaxBusyInterceptor]) // <--- insert the axaj interceptor
    ),
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

```
#### Declaration of the spinner(app.html)
``` html 

<main class="content">
  <router-outlet />
  <app-spinner></app-spinner> <!-- the ajax spinner component -->
</main>
```
