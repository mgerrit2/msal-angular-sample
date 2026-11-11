export interface JwtTokenResponseDto {
  sub?: string;
  name?: string;
  oid?: string;
  exp?: number;
  iat?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // fallback for other claims
}
