import { InjectionToken } from '@angular/core';
import { IAuthConfig } from '@intapp/auth/models';

/**
 * Token de injeção da configuração de auth (apiUrl, allowedDomains).
 * Provisionado por `provideAuth({...})`.
 */
export const AUTH_CONFIG = new InjectionToken<IAuthConfig>('AUTH_CONFIG');
