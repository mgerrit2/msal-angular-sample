import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, from, switchMap, catchError} from 'rxjs';
import {MsalService} from '@azure/msal-angular';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RestApi {

  private endpoint = '/protected';
  private scopes = ['api://3b2948af-005e-461a-bcfe-3024f8239c32/access_as_user'];

  constructor(
    private http: HttpClient,
    private msalService: MsalService
  ) {}


  getProtectedData(): Observable<string> {
    const account = this.msalService.instance.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];

    // Try silent acquisition first
    return from(
      this.msalService.instance.acquireTokenSilent({
        scopes: this.scopes,
        account: account
      })
    ).pipe(
      catchError((error) => {
        console.warn('Silent token acquisition failed, opening consent popup...', error);
        // Force the interactive popup when silent fails (e.g. missing consent)
        return from(
          this.msalService.instance.acquireTokenPopup({
            scopes: this.scopes,
            account: account
          })
        );
      }),
      switchMap((response) => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${response.accessToken}`
        });
        return this.http.get(`${environment.apiUrl}/api/protected`, { headers, responseType: 'text' });
      })
    );

  }
}
