export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IUser {
  id: string;
  username: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface ILoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: IUser;
}

export interface IRefreshResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface IApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: { field: string; message: string }[];
}

export interface IAuthConfig {
  apiUrl: string;
  allowedDomains: string[];

  defaultAuthenticatedRoute?: string;
}
