import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { I18nService } from '@intapp/i18n';
import { MessageService } from 'primeng/api';

import { apiErrorToastInterceptor } from './api-error-toast.interceptor';

describe('apiErrorToastInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let messages: MessageService;
  let i18n: I18nService;
  let addSpy: jest.SpyInstance;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorToastInterceptor])),
        provideHttpClientTesting(),
        MessageService,
        I18nService,
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    messages = TestBed.inject(MessageService);
    i18n = TestBed.inject(I18nService);

    await i18n.setLocale('pt-BR');
    addSpy = jest.spyOn(messages, 'add');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('success', () => {
    it('should not show a toast when the request completes without error', done => {
      http.get('/api/deals').subscribe(() => {
        expect(addSpy).not.toHaveBeenCalled();
        done();
      });
      httpMock.expectOne('/api/deals').flush([]);
    });
  });

  describe('silenced URLs', () => {
    it('should not show a toast for /api/auth/refresh', done => {
      http.post('/api/auth/refresh', null).subscribe({
        error: () => {
          expect(addSpy).not.toHaveBeenCalled();
          done();
        },
      });
      httpMock.expectOne('/api/auth/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should not show a toast for /api/auth/logout', done => {
      http.post('/api/auth/logout', null).subscribe({
        error: () => {
          expect(addSpy).not.toHaveBeenCalled();
          done();
        },
      });
      httpMock.expectOne('/api/auth/logout').flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('message extraction', () => {
    it('should use err.error.message when the backend returns canonical ApiError', done => {
      http.post('/api/auth/login', {}).subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'error', detail: 'Bad credentials' }),
          );
          done();
        },
      });
      httpMock
        .expectOne('/api/auth/login')
        .flush({ message: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should use err.error string when the backend returns plain text', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: 'plain text error' }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush('plain text error', { status: 500, statusText: 'Server Error' });
    });

    it('should fall back to i18n apiErrorNoNetwork on status 0 without body', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: i18n.t('apiErrorNoNetwork') }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').error(new ProgressEvent('error'), { status: 0, statusText: '' });
    });

    it('should fall back to i18n apiErrorUnauthorized on 401 without body', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: i18n.t('apiErrorUnauthorized') }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should use err.statusText on 500 without body', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: 'Internal Server Error' }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should use generic apiErrorToastTitle summary on every toast shown', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ summary: i18n.t('apiErrorToastTitle') }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('error propagation', () => {
    it('should continue propagating HttpErrorResponse to the caller', done => {
      http.get('/api/deals').subscribe({
        error: err => {
          expect(err.status).toBe(500);
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 500, statusText: 'Server Error' });
    });
  });
});
