import {AccountInfo} from '@azure/msal-browser';
import {JwtTokenResponseDto} from '../dto/JwtTokenResponseDto';
import { jwtDecode } from "jwt-decode";

interface CustomJwtPayload {
  sub: string;
  email: string;
  name: string;
  tid?: string; // tenant id if applicable
}

export function mapTokenToAccountInfo(tokenResponse: JwtTokenResponseDto, rawToken?: string): AccountInfo {
  // Use optional chaining or bracket notation safely
  const subject = tokenResponse['sub'] || tokenResponse['oid'] || '';
  const email = tokenResponse['email'] || tokenResponse['upn'] || tokenResponse['preferred_username'] || '';

  return {
    homeAccountId: subject,
    environment: 'custom-auth-server',
    tenantId: tokenResponse['tid'] || 'common',
    username: email,
    localAccountId: subject,
    name: tokenResponse['name'] || '',
    idToken: rawToken || '', // Pass the raw JWT string if you have it
    idTokenClaims: tokenResponse as any,
  };
}
