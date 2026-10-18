## install primeng

npm install primeng@21 @primeng/themes@21 --legacy-peer-deps

 
```typescipt
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.my-app-dark' // optional
            }
        }
    })
  ]
};
```

## Adding bootstrap

npm install bootstrap @popperjs/core  --legacy-peer-deps

## fix
npm audit fix --legacy-peer-deps`
