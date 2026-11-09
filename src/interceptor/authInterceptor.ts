import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, switchMap } from 'rxjs';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('authInterceptor hit');

  if(environment.debug){
    const customToken = localStorage.getItem('custom_token');
    if (customToken) {

      if (customToken) {
        const clonedReq = req.clone({
          setHeaders: {Authorization: `Bearer ${customToken}`}
        });
        return next(clonedReq);
      }
    }
  }



  // 2. Otherwise, fall back to standard MSAL Entra ID token logic
  const msalService = inject(MsalService);
  const account = msalService.instance.getActiveAccount();

  if (!account) {
    return next(req);
  }

// FIXED: Access environment properties directly matching your environment configuration
  const tokenRequest = {
    scopes: [environment.scopes], // Or environment.scopes if it's already an array
    account: account
  };

  return from(msalService.instance.acquireTokenSilent(tokenRequest)).pipe(
    switchMap(response => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });
      return next(authReq);
    })
  );
};
