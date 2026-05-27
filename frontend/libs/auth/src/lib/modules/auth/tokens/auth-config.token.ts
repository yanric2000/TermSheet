import { InjectionToken } from '@angular/core';
import { IAuthConfig } from '@intapp/auth/models';

export const AUTH_CONFIG = new InjectionToken<IAuthConfig>('AUTH_CONFIG');
