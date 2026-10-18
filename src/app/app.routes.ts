import { Routes } from '@angular/router';
import {MsalGuard} from '@azure/msal-angular';
import {ProfileComponent} from './components/profile-component/profile-component';
import {Home} from './components/home/home';


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
    path: '**',
    redirectTo: '' // Optioneel: Stuur onbekende URL's terug naar Home
  }
];
