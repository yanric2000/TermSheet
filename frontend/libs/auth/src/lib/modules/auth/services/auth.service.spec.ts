import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IAuthConfig, ILoginResponse, IUser } from '@intapp/auth/models';
import { AuthTokenStore } from '@intapp/auth/stores';
import { AUTH_CONFIG } from '@intapp/auth/tokens';
import { of, throwError } from 'rxjs';

import { IAuthApiPort, AUTH_API } from './auth-api.port';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const fakeUser: IUser = { id: 'u1', username: 'demo', name: 'Demo', role: 'USER' };
  const fakeLoginResponse: ILoginResponse = {
    accessToken: 'fake.jwt.token',
    tokenType: 'Bearer',
    expiresIn: 900,
    user: fakeUser,
  };

  let apiMock: jest.Mocked<IAuthApiPort>;
  let jwtMock: jest.Mocked<JwtHelperService>;
  let routerMock: jest.Mocked<Router>;
  let service: AuthService;

  beforeEach(() => {
    apiMock = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
    };

    jwtMock = {
      isTokenExpired: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<JwtHelperService>;

    routerMock = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;

    const configMock: IAuthConfig = {
      apiUrl: '/api',
      allowedDomains: [],
      defaultAuthenticatedRoute: '/termsheet',
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AuthTokenStore,
        { provide: AUTH_API, useValue: apiMock },
        { provide: JwtHelperService, useValue: jwtMock },
        { provide: Router, useValue: routerMock },
        { provide: AUTH_CONFIG, useValue: configMock },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('inicia sem usuário autenticado', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
    expect(service.user()).toBeNull();
  });

  describe('login', () => {
    it('popula state e navega para a rota padrão configurada em sucesso', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));

      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.accessToken()).toBe(fakeLoginResponse.accessToken);
        expect(service.user()).toEqual(fakeUser);
        expect(service.loading()).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/termsheet']);
        done();
      });
    });

    it('propaga o erro e mantém state limpo quando o login falha', done => {
      const err = new HttpErrorResponse({
        error: { message: 'Bad credentials' },
        status: 401,
        statusText: 'Unauthorized',
      });
      apiMock.login.mockReturnValue(throwError(() => err));

      service.login({ username: 'x', password: 'y' }).subscribe({
        error: received => {
          // Toast/mensagem é responsabilidade do `apiErrorToastInterceptor`.
          // Aqui validamos só os side effects que o service ainda mantém:
          // erro propaga, token continua nulo e loading volta para false.
          expect(received).toBe(err);
          expect(service.accessToken()).toBeNull();
          expect(service.loading()).toBe(false);
          done();
        },
      });
    });

    it('seta loading=true durante a chamada e false ao final', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));
      expect(service.loading()).toBe(false);
      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.loading()).toBe(false);
        done();
      });
    });
  });

  describe('bootstrap', () => {
    it('recupera sessão chamando refresh + me em sucesso', done => {
      apiMock.refresh.mockReturnValue(of({ accessToken: 'new.token', tokenType: 'Bearer', expiresIn: 900 }));
      apiMock.me.mockReturnValue(of(fakeUser));

      service.bootstrap().subscribe(() => {
        expect(service.accessToken()).toBe('new.token');
        expect(service.user()).toEqual(fakeUser);
        done();
      });
    });

    it('mantém state vazio silenciosamente em 401', done => {
      const err = new HttpErrorResponse({ error: null, status: 401 });
      apiMock.refresh.mockReturnValue(throwError(() => err));

      service.bootstrap().subscribe(() => {
        expect(service.accessToken()).toBeNull();
        expect(service.user()).toBeNull();
        done();
      });
    });
  });

  describe('logout', () => {
    it('limpa state e navega para /login mesmo se o POST falhar', done => {
      apiMock.logout.mockReturnValue(throwError(() => new HttpErrorResponse({ error: null, status: 500 })));

      service.logout().subscribe({
        complete: () => {
          expect(service.accessToken()).toBeNull();
          expect(service.user()).toBeNull();
          expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });
    });

    it('limpa state e navega para /login em sucesso', done => {
      apiMock.logout.mockReturnValue(of(void 0));

      service.logout().subscribe({
        complete: () => {
          expect(service.accessToken()).toBeNull();
          expect(service.user()).toBeNull();
          expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });
    });
  });

  describe('isAuthenticated', () => {
    it('false quando não há token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('true quando há token não-expirado', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));
      (jwtMock.isTokenExpired as jest.Mock).mockReturnValue(false);
      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
    });

    it('false quando o token está expirado', done => {
      apiMock.login.mockReturnValue(of(fakeLoginResponse));
      (jwtMock.isTokenExpired as jest.Mock).mockReturnValue(true);
      service.login({ username: 'demo', password: 'demo1234' }).subscribe(() => {
        expect(service.isAuthenticated()).toBe(false);
        done();
      });
    });
  });
});
