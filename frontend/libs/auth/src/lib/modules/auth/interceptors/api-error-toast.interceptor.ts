import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IApiError } from '@intapp/auth/models';
import { I18nService } from '@intapp/i18n';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

/**
 * URLs onde o toast NÃO deve aparecer.
 *
 *  - `/auth/refresh`: chamada no bootstrap silencioso da aplicação. Para
 *    usuários anônimos ela sempre falha (cookie inexistente/expirado) — o
 *    `AuthService.bootstrap()` já trata isso devolvendo estado vazio e
 *    deixando o `authGuard` mandar para `/login`. Disparar toast aqui
 *    poluiria a UX inicial.
 *  - `/auth/logout`: best-effort. Se o servidor já invalidou a sessão ou
 *    está fora do ar, queremos completar o cleanup local sem aborrecer o
 *    usuário com toast no caminho de saída.
 *
 * Lista fixa — granularidade por request foi descartada conscientemente:
 * o produto é pequeno o suficiente para que esses dois casos cobrem 100%
 * do "boot/logout silencioso". Se um dia precisar mais flexibilidade,
 * troca-se por um `HttpContextToken` sem mudar a API pública do interceptor.
 */
const SILENCED_URLS = [/\/api\/auth\/(refresh|logout)$/];

/**
 * Interceptor funcional que captura qualquer erro HTTP propagado pelo `HttpClient`
 * e dispara automaticamente um toast no canto superior direito (via PrimeNG
 * `MessageService` consumido por um `<p-toast>` global em `AppComponent`).
 *
 * O erro continua propagando via `throwError`: o caller pode usar `catchError`
 * para reagir (ex.: parar `loading` flag) sem precisar montar a notificação.
 *
 * Decisões de design:
 *  - `inject()` no topo (contexto de DI). Os helpers recebem dependencies
 *    por argumento porque `catchError` é executado fora do contexto inicial.
 *  - Sem `try/catch` (`MessageService.add` não lança em condições normais e,
 *    se um dia lançar, queremos visibilidade — não silenciamento).
 *  - Backend mensagens vencem sobre fallbacks i18n. O servidor já é
 *    responsável pelas suas próprias mensagens (Spring Security devolve
 *    "Bad credentials" no body do 401 do login, por exemplo).
 */
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

/**
 * Resolve a mensagem mais informativa possível para o usuário, com cascata
 * de fallbacks:
 *
 *  1. `err.error` string crua (alguns endpoints retornam só texto).
 *  2. `err.error.message` (formato canônico do `ApiError` do backend Spring).
 *  3. Fallbacks i18n por status HTTP (sem rede, 401, default).
 *  4. `err.statusText` ou `apiErrorUnexpected` como último recurso.
 *
 * Centralizar aqui evita repetir essa lógica em cada feature. Quando o
 * backend retornar uma mensagem específica, ela ganha precedência sobre
 * qualquer i18n local — o servidor já é a fonte da verdade para erros de
 * negócio.
 */
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
