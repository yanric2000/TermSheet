import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { apiErrorToastInterceptor, credentialsInterceptor, provideAuth } from '@intapp/auth';
import { provideI18n } from '@intapp/i18n';
import { MessageService } from 'primeng/api';

import { environment } from '../environments/environment';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimations(),
    MessageService,
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([credentialsInterceptor, apiErrorToastInterceptor])),
    provideI18n(),
    provideAuth({
      apiUrl: environment.apiUrl,
      allowedDomains: environment.allowedDomains,
      defaultAuthenticatedRoute: '/termsheet',
    }),
  ],
};
