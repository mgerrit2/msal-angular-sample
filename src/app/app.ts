import {Component, OnInit, signal,OnDestroy} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import {firstValueFrom, Subject} from 'rxjs';
import {MsalBroadcastService, MsalService} from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {environment} from '../environments/environment';
import {Spinner} from './components/spinner/spinner';
import {TypeOfuser} from './type-ofuser';
import {SelectModule} from 'primeng/select';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MenubarModule,
    CommonModule,
    ButtonModule,
    Spinner,
    SelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  /** Titel van de applicatie */
  protected readonly title = signal('Angular Entra ID Auth');

  typeOfUsersHidden = false;

  typeOfUsers!: TypeOfuser[];

  form  = new FormGroup({
    typeOfUsers: new FormControl<TypeOfuser | null>(null),
  });

  //region getters for formcontrol
  get getTypeOfUsers(): FormControl {
    // We cast it to FormControl to easily access its value property later
    return this.form.get('typeOfUsers') as FormControl;
  }

  /** Items voor de PrimeNG menubar */
  items: MenuItem[] | undefined;

  /** Geeft aan of de gebruiker is ingelogd */
  loginDisplay = false;

  /** Subject om actieve subscriptions te stoppen bij vernietiging van de component (memory leak prevention) */
  private readonly _destroying$ = new Subject<void>();

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) {}

  async ngOnInit() {

    if(environment.debug){
      this.typeOfUsersHidden = true;
    }

    this.typeOfUsers = [
      { name: 'EntraID', code: '1' },
      { name: 'Jon Doe', code: '2' },
    ];

    // Now it is 100% safe to set the default value to position 0 (the second item)
    if (this.typeOfUsers.length > 1) {
      this.form.patchValue({
        typeOfUsers: this.typeOfUsers[0]
      });
    }

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

    // Eventueel URL opschonen als er nog query params (zoals ?state) in staan na redirect/logout
    if (window.location.search || window.location.hash.includes('state=')) {
      await this.router.navigate([], { replaceUrl: true });
    }

    //region Menu instellingen configureren
    this.items = [
      {
        label: 'Profile',
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

    if (this.getTypeOfUsers.value.code === "1" ) {
      // Triggers redirect login (or use loginPopup())
      this.authService.loginRedirect();
    } else if(this.getTypeOfUsers.value.code === "2") {
      this.loginDisplay = true;
      localStorage.setItem('custom_token','eyJ0eXAiOiJKV1QiLCJraWQiOiI3L05BZHJaekFjN2wiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJvYXV0aCIsImF6cCI6IjZyTDRaWkhPS2VIWiIsImF6cGFjciI6ImZyT0Y2QVBoNFphUCIsIm5hbWUiOiJKb24gRG9lIiwib2lkIjoiNzE0YzY0ZDItMzA5YS00YmRjLTg2ODUtYzUzMTNjY2YwYWUyIiwicmgiOiIwLkFRQUJBUWpFNzB2OHZRKzEyMzQiLCJ0aWQiOiIwLkFRQUJBUWpFNzB2OHZRKzEyMzQiLCJ2ZXIiOiIxLjAiLCJ4bXNfZnRkIjoiRlRELVhNUy1FVVItMjAyNjExLTAwMDEiLCJzdWIiOiJqb25kb2UiLCJhdWQiOiJrVVovL08xck9wZXQiLCJpYXQiOjE3OTQxNTQ5OTIsImV4cCI6MTc5NDI0MTM5Mn0.SrqxEKhGhD8IQ2gKcs3v3B4FeMNOnIb3d4vfmbPIA9k');
    }

   }

  /**
   * Logt de gebruiker uit via een MSAL redirect.
   */
  logout() {

    if (this.getTypeOfUsers.value.code === "1" ) {
      this.authService.logoutRedirect({
        postLogoutRedirectUri: environment.redirectUri // Stuurt de gebruiker terug naar jouw frontend URL!
      });
    } else if(this.getTypeOfUsers.value.code === "2") {
      this.loginDisplay = false;
      localStorage.setItem('custom_token','');
    }


    //localStorage.setItem('custom_token','');
  }

  /**
   * Ruimt alle actieve subscriptions op om geheugenlekken te voorkomen.
   */
  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }

}
