import { Injectable, signal } from '@angular/core';
import {AuthProfile} from '../../app/dto/auth-profile';

@Injectable({
  providedIn: 'root'
})
export class AuthTypeService {
  // Using a signal or regular property
  authType = signal<AuthProfile>({ name: 'EntraID', code: '1', jwtString: '' });
}
