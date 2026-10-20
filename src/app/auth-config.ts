import { Configuration, LogLevel } from '@azure/msal-browser';
import { environment } from '../environments/environment';

export const msalConfig: Configuration = {
  auth: {
    clientId:environment.clientId, // From Entra App Registration
    authority: environment.authority,
    redirectUri: environment.redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage'
  }
};
