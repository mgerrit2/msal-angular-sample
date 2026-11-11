export interface JwtTokenResponseDto {
  sub?: string;
  name?: string;
  oid?: string;
  exp?: number;
  iat?: number;
  [key: string]: any; // fallback for other claims
}
