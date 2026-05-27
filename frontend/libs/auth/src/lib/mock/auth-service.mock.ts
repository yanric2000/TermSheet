import { signal } from '@angular/core';
import { AuthService } from '@intapp/auth';
import type { IUser } from '@intapp/auth/models';
import { createJestSpyObject } from '@intapp/util/jest';
import { EMPTY } from 'rxjs';

export const authServiceMockFactory = (user: IUser | null = null) => {
  const mock = createJestSpyObject<AuthService>(['logout'], { user: signal(user) });
  mock.logout.mockReturnValue(EMPTY);
  return mock;
};

export const authServiceProviderFactory = (user: IUser | null = null) => ({
  provide: AuthService,
  useValue: authServiceMockFactory(user),
});
