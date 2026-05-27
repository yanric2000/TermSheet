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
    // Locale determinístico independente do navegador do CI.
    await i18n.setLocale('pt-BR');
    addSpy = jest.spyOn(messages, 'add');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('sucesso', () => {
    it('não dispara toast quando a request completa sem erro', done => {
      http.get('/api/deals').subscribe(() => {
        expect(addSpy).not.toHaveBeenCalled();
        done();
      });
      httpMock.expectOne('/api/deals').flush([]);
    });
  });

  describe('URLs silenciadas', () => {
    it('não dispara toast em /api/auth/refresh', done => {
      http.post('/api/auth/refresh', null).subscribe({
        error: () => {
          expect(addSpy).not.toHaveBeenCalled();
          done();
        },
      });
      httpMock.expectOne('/api/auth/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('não dispara toast em /api/auth/logout', done => {
      http.post('/api/auth/logout', null).subscribe({
        error: () => {
          expect(addSpy).not.toHaveBeenCalled();
          done();
        },
      });
      httpMock.expectOne('/api/auth/logout').flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('extração de mensagem', () => {
    it('usa err.error.message quando o backend devolve ApiError canônico', done => {
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

    it('usa err.error string quando o backend devolve texto puro', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: 'plain text error' }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush('plain text error', { status: 500, statusText: 'Server Error' });
    });

    it('fallback i18n apiErrorNoNetwork em status 0 sem body', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: i18n.t('apiErrorNoNetwork') }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').error(new ProgressEvent('error'), { status: 0, statusText: '' });
    });

    it('fallback i18n apiErrorUnauthorized em 401 sem body', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: i18n.t('apiErrorUnauthorized') }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('usa err.statusText em 500 sem body', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: 'Internal Server Error' }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('usa o título genérico apiErrorToastTitle em todo toast disparado', done => {
      http.get('/api/deals').subscribe({
        error: () => {
          expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ summary: i18n.t('apiErrorToastTitle') }));
          done();
        },
      });
      httpMock.expectOne('/api/deals').flush(null, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('propagação do erro', () => {
    it('continua propagando o HttpErrorResponse para o caller', done => {
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
