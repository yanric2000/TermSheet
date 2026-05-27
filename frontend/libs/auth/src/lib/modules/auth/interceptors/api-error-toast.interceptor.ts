import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IApiError } from '@intapp/auth/models';
import { I18nService } from '@intapp/i18n';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

const SILENCED_URLS = [/\/api\/auth\/(refresh|logout)$/];

export const apiErrorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const i18n = inject(I18nService);
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!SILENCED_URLS.some(pattern => pattern.test(req.url))) {
        messages.add({
          severity: 'error',
          summary: i18n.t('apiErrorToastTitle'),
          detail: extractErrorMessage(err, i18n),
          life: 5000,
        });
      }
      return throwError(() => err);
    }),
  );
};

function extractErrorMessage(err: HttpErrorResponse, i18n: I18nService): string {
  const body = err.error as Partial<IApiError> | string | null | undefined;
  if (typeof body === 'string' && body.trim().length > 0) return body;
  if (body && typeof body === 'object' && typeof body.message === 'string' && body.message.length > 0) {
    return body.message;
  }
  if (err.status === 0) return i18n.t('apiErrorNoNetwork');
  if (err.status === 401) return i18n.t('apiErrorUnauthorized');
  return err.statusText || i18n.t('apiErrorUnexpected');
}
