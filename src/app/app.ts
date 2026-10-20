import {Component, OnInit, signal,OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import {firstValueFrom, Subject} from 'rxjs';
import {MsalBroadcastService, MsalService} from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenubarModule,CommonModule, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  /** Titel van de applicatie */
  protected readonly title = signal('Angular Entra ID Auth');

  /** Items voor de PrimeNG menubar */
  items: MenuItem[] | undefined;

  /** Geeft aan of de gebruiker is ingelogd */
  loginDisplay = false;

  /** Subject om actieve subscriptions te stoppen bij vernietiging van de component (memory leak prevention) */
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  async ngOnInit() {

    // 1. CRUCIAAL: Vang de redirect/code op van Microsoft en ruim de URL op!
    this.authService.handleRedirectObservable()
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: (result) => {
          if (result) {
            console.log('Login succesvol via redirect:', result);
            this.authService.instance.setActiveAccount(result.account);
          }
        },
        error: (error) => {
          console.error('Fout bij verwerken redirect:', error);
        }
      });

    //region Menu instellingen configureren
    this.items = [
      {
        label: 'profile',
        icon: 'pi pi-home',
        routerLink: ['/profile']
      },
      {
        label: 'API call',
        icon: 'pi pi-home',
        routerLink: ['/app-api-call-component']
      }
    ]
    //endregion

    //region Listen for successful login events
    try {
      await firstValueFrom(
        this.msalBroadcastService.msalSubject$.pipe(
          filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
          takeUntil(this._destroying$)
        )
      );
      this.setLoginDisplay();
    } catch(e) {
      console.log(e)
    }

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
    //endregion
  }

  /**
   * Controleert of er actieve accounts bekend zijn en werkt de login-weergave bij.
   */
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  /**
   * Start het inlogproces via een MSAL redirect.
   */
  login() {
    // Triggers redirect login (or use loginPopup())
    this.authService.loginRedirect();
  }

  /**
   * Logt de gebruiker uit via een MSAL redirect.
   */
  logout() {
    this.authService.logoutRedirect();
  }

  /**
   * Ruimt alle actieve subscriptions op om geheugenlekken te voorkomen.
   */
  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }

}
