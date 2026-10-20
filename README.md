# Project for testing Azure entra-id


## Features
- implementing ajax spinner
- implementing


## Ajax implementation
### Purpose
To show spinner with slow rest api call

#### The interceptor implementation(ajax-busy-interceptor.ts)
``` java
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
``` java
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
``` java
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
