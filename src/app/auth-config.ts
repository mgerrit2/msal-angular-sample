import { Configuration, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: '1d2796fb-6f52-4590-b6be-c22dbba8e30a', // From Entra App Registration
    authority: 'https://login.microsoftonline.com/aafea113-8a60-476f-97e1-f518d6cd5db0',
    redirectUri: 'http://localhost:4200/',
  },
  cache: {
    cacheLocation: 'localStorage'
  }
};
