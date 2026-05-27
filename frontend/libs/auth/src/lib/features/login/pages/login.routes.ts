import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { publicOnlyGuard } from '@intapp/auth/guards';
import { I18nService } from '@intapp/i18n';

const loginTitle: ResolveFn<string> = () => inject(I18nService).pageTitle('pageTitleLogin');

export const loginRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    title: loginTitle,
  },
];
