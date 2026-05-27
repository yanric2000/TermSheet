export { provideAuth } from './lib/auth.providers';
export { authRoutes } from './lib/features/auth.routes';
export { authGuard, publicOnlyGuard } from './lib/modules/auth/guards/auth.guard';
export { AuthService } from './lib/modules/auth/services/auth.service';
export { apiErrorToastInterceptor } from './lib/modules/auth/interceptors/api-error-toast.interceptor';
export { credentialsInterceptor } from './lib/modules/auth/interceptors/credentials.interceptor';
export type {
  IAuthConfig,
  ILoginRequest,
  ILoginResponse,
  IRefreshResponse,
  IUser,
  IApiError,
} from './lib/modules/auth/models/auth.models';
