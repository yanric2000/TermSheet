import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/pages/login.routes').then(m => m.loginRoutes),
  },
];
