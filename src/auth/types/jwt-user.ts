export interface JwtUser {
  id: number;
  email: string;
}

export interface JwtRefreshUser {
  sub: number;
  email: string;
  refreshToken?: string;
}
