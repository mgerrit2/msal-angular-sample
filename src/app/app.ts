import {Component, OnInit, signal, OnDestroy,inject} from '@angular/core';
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
import {SelectChangeEvent, SelectModule} from 'primeng/select';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {AuthProfile} from './dto/auth-profile';
import {AuthTypeService} from '../services/shared/auth-type.service';

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
    ReactiveFormsModule,
    InputText
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  /** Titel van de applicatie */
  protected readonly title = signal('Angular Entra ID Auth');

  // shared service
  private authTypeServiceInterceptor = inject(AuthTypeService);

  private _typeOfAuthentication = signal<AuthProfile>({name:'EntraID',code:'1',jwtString:''});

  //shared authservice
  private authTypeService = inject(AuthTypeService);

  // Expose it as read-only to components
  typeOfAuthentication = this._typeOfAuthentication.asReadonly();

  typeOfUsersHidden = false;
  jwttokenHidden = false;

  typeOfUsers!: TypeOfuser[];

  form  = new FormGroup({
    typeOfUsers: new FormControl<TypeOfuser | null>(null),
    jwtToken: new FormControl<TypeOfuser | null>(null)
  });

  //region getters for formcontrol
  get getTypeOfUsers(): FormControl {
    // We cast it to FormControl to easily access its value property later
    return this.form.get('typeOfUsers') as FormControl;
  }

  get getJwtToken(): FormControl {
    // We cast it to FormControl to easily access its value property later
    return this.form.get('jwtToken') as FormControl;
  }


  /** Items voor de PrimeNG menubar */
  items: MenuItem[] | undefined;

  /** Geeft aan of de gebruiker is ingelogd */
  loginDisplay = false;

  /** Subject om actieve subscriptions te stoppen bij vernietiging van de component (memory leak prevention) */
  private readonly _destroying$ = new Subject<void>();

  private readonly authService = inject(MsalService);
  private readonly msalBroadcastService= inject(MsalBroadcastService);
  private readonly router = inject(Router);


  async ngOnInit() {

    if(environment.debug){
      this.typeOfUsersHidden = true;
      this.jwttokenHidden= false;
    }

    this.typeOfUsers = [
      { name: 'EntraID', code: '1' },
      { name: 'custom JWT', code: '2' },
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

      this.authTypeServiceInterceptor.authType.set({ name: 'EntraID', code: '1', jwtString: '' });

      // Triggers redirect login (or use loginPopup())
      this.authService.loginRedirect();

    } else if(this.getTypeOfUsers.value.code === "2") {

      this.authTypeService.authType.set({ name: 'custom JWT', code: '2', jwtString: this.getJwtToken.value });
      this.loginDisplay = true;
      localStorage.setItem('custom_token',this.getJwtToken.value);
    }

   }

  /**
   * Logt de gebruiker uit via een MSAL redirect.
   */
  logout() {

    if (this.getTypeOfUsers.value.code === "1" ) {

      // clear custom_token, other
      localStorage.setItem('custom_token','');
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


  typeOfUsersChange(event:SelectChangeEvent) :void{

    if(event?.value?.code === '1'){
      this._typeOfAuthentication.set({name:'EntraID',code:'1',jwtString:''});

      this.jwttokenHidden=false;
    } else {

     const customJWTToken = localStorage.getItem('custom_token');

      if(customJWTToken !== '' ){
        this.getJwtToken.setValue(customJWTToken);
      }

      this._typeOfAuthentication.set({name:'custom JWT',code:'2',jwtString:this.getJwtToken.value});
      this.jwttokenHidden = true;
    }
  }

  onJwtPaste(): void {
// Wait for the browser to finish inserting the pasted text
    setTimeout(() => {
      this._typeOfAuthentication.set({name:'custom JWT',code:'2',jwtString:this.getJwtToken.value});
    }, 0);
  }

}
