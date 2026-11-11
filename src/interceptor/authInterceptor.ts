import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, switchMap } from 'rxjs';
import { environment } from '../environments/environment';
import {App} from '../app/app';
import {AuthTypeService} from '../services/shared/auth-type.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authTypeService = inject(AuthTypeService);

  // 1. Custom Token Flow (Authentication code '2')
  if (authTypeService.authType().code === '2') {
    console.log('authInterceptor hit (Custom Token)');

    if (environment.debug) {
      const customToken = localStorage.getItem('custom_token');
      if (customToken) {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${customToken}` }
        });
        return next(clonedReq);
      }
    }

    // Fallback if type is '2' but debug is false or customToken is missing
    return next(req);
  }

  // 2. Standard MSAL Entra ID token logic
  const msalService = inject(MsalService);
  const account = msalService.instance.getActiveAccount();

  if (!account) {
    return next(req);
  }

  const tokenRequest = {
    scopes: [environment.scopes],
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
}
