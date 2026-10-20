import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, from, switchMap, catchError} from 'rxjs';
import {MsalService} from '@azure/msal-angular';
import {environment} from '../../environments/environment';

/**
 * Service voor het communiceren met de beveiligde Spring Boot backend API.
 * Handelt automatische token-acquisitie (silent en popup fallback) en autorisatieheaders af via MSAL.
 */
@Injectable({
  providedIn: 'root',
})
export class RestApi {

  /**
   * De benodigde MSAL-scopes voor API-toegang.
   * Zorgt ervoor dat scopes altijd als een correcte string[] array worden meegegeven,
   * ongeacht of environment.scopes een string of al een array is.
   */
  private readonly scopes: string[] = Array.isArray(environment.scopes)
    ? environment.scopes
    : [environment.scopes];

  /**
   * @constructor
   * @param http - Angular HttpClient voor het uitvoeren van HTTP-verzoeken
   * @param msalService - MSAL service voor authenticatie en token-beheer
   */
  constructor(
    private http: HttpClient,
    private msalService: MsalService
  ) {}

  /**
   * Haalt beveiligde data op van de backend API.
   *
   * Probeert eerst om een toegangstoken stil (`acquireTokenSilent`) op te halen.
   * Mocht dit falen (bijvoorbeeld door ontbrekende toestemming of verlopen sessie),
   * dan wordt automatisch teruggevallen op een interactieve popup (`acquireTokenPopup`).
   * Vervolgens wordt het Bearer-token toegevoegd aan de headers van het GET-verzoek.
   *
   * @returns Een Observable die de responsedata als string teruggeeft
   */
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
