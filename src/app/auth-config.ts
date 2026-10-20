import { Configuration, LogLevel } from '@azure/msal-browser';
import { environment } from '../environments/environment';

export const msalConfig: Configuration = {
  auth: {
    clientId:environment.clientId, // From Entra App Registration
    authority: 'https://login.microsoftonline.com/aafea113-8a60-476f-97e1-f518d6cd5db0',
    redirectUri: environment.redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage'
  }
};
