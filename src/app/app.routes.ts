import { Routes } from '@angular/router';
import {MsalGuard} from '@azure/msal-angular';
import {ProfileComponent} from './components/profile-component/profile-component';
import {Home} from './components/home/home';
import {ApiCallComponent} from './components/api-call-component/api-call-component';


export const routes: Routes = [
  {
    path: '',
    component: Home // Public page - NO MsalGuard here
  },
  {
    path: 'profile',
    component: ProfileComponent,
    //canActivate: [MsalGuard] // Beveiligde route met MSAL Guard
  },
  {
    path: 'app-api-call-component',
    component: ApiCallComponent,
    //canActivate: [MsalGuard] // Beveiligde route met MSAL Guard
  },
  {
    path: '**',
    redirectTo: '' // Optioneel: Stuur onbekende URL's terug naar Home
  }
];
