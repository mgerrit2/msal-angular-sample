import {Component, inject, OnInit} from '@angular/core';
import {MsalService} from '@azure/msal-angular';
import {CommonModule} from '@angular/common';
import { AccountInfo } from '@azure/msal-browser';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {App} from '../../app';
import {RestApi} from '../../rest/rest-api';
import {firstValueFrom} from 'rxjs';
import {mapTokenToAccountInfo} from '../../mappings/MapTokenToAccountInfo';

@Component({
  selector: 'app-profile-component',
  imports: [CommonModule, Accordion, AccordionContent, AccordionHeader, AccordionPanel],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export class ProfileComponent implements OnInit {
  profileData?: AccountInfo;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  idTokenClaims?: any;

  private app = inject(App);
  private jwtTokenService = inject(RestApi);
  private authService = inject(MsalService);

  async ngOnInit(): Promise<void> {

    if(this.app?.typeOfAuthentication()?.code === '1'){
      this.profileData = this.authService.instance.getActiveAccount() || undefined;

      // 2. Extract specific claims if available
      if (this.profileData) {
        this.idTokenClaims = this.profileData.idTokenClaims;
      }
    } else {

      try {

        const jwt = await firstValueFrom(this.jwtTokenService.getJwtInfo(this.app.typeOfAuthentication().jwtString));

        this.profileData = mapTokenToAccountInfo(jwt)

        console.log(jwt);
      } catch (e) {
        console.error(e);
      }

    }
  }
}
