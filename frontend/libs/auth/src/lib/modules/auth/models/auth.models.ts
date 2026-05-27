/**
 * Payload enviado ao backend para autenticação.
 * Espelha `LoginRequest.java` (username/password com 4-100 caracteres).
 */
export interface ILoginRequest {
  username: string;
  password: string;
}

/**
 * Usuário autenticado, conforme retornado pelo backend Spring (`UserResponse.java`).
 */
export interface IUser {
  id: string;
  username: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Resposta de `POST /api/auth/login`.
 * O refresh token NÃO vem aqui — ele é entregue como cookie HttpOnly via `Set-Cookie`.
 */
export interface ILoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: IUser;
}

/**
 * Resposta de `POST /api/auth/refresh`.
 * Mesma forma do login, sem o usuário (que é buscado via `/auth/me`).
 */
export interface IRefreshResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

/**
 * Formato padronizado de erro do backend (`ApiError.java`).
 * Usado para extrair mensagens user-friendly e erros por campo no front.
 */
export interface IApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: { field: string; message: string }[];
}

/**
 * Configuração consumida por `provideAuth({ apiUrl, allowedDomains, defaultAuthenticatedRoute? })`.
 */
export interface IAuthConfig {
  apiUrl: string;
  allowedDomains: string[];
  /**
   * Rota para onde redirecionar após login bem-sucedido e no `publicOnlyGuard`
   * (quando um usuário já autenticado tenta acessar `/login`).
   *
   * Default `'/'`. O app host deve passar a rota da sua tela inicial autenticada
   * (ex.: `'/termsheet'` para o produto TermSheet).
   */
  defaultAuthenticatedRoute?: string;
}
