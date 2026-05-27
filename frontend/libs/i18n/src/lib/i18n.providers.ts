import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import { APP_INITIALIZER, EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders, inject } from '@angular/core';
import { I18nService } from '@intapp/i18n/services';

/**
 * Registra dados de locale do Angular usados por `DatePipe`, `CurrencyPipe`,
 * `DecimalPipe` etc. en-US é o default embutido no compilador — só precisamos
 * registrar pt e es. Chamamos no escopo do módulo para que os dados estejam
 * disponíveis antes do bootstrap dos componentes que dependem dos pipes.
 */
registerLocaleData(localePt);
registerLocaleData(localeEs);

/**
 * Configura a infraestrutura de i18n na aplicação.
 *
 * O que faz:
 *  1. Liga `LOCALE_ID` ao locale corrente do `I18nService`. Por limitação do
 *     Angular, este token é resolvido uma vez na criação do injector, então
 *     `DatePipe`/`CurrencyPipe`/`DecimalPipe` ficam no locale inicial até o
 *     próximo reload. Strings via `i18n.t(...)` continuam reativas.
 *  2. `APP_INITIALIZER` aguarda `i18n.bootstrap()` — que faz o `import()`
 *     dinâmico do catálogo do locale ativo e do mapa do PrimeNG. O bootstrap
 *     da aplicação não continua até a Promise resolver, garantindo que
 *     nenhum template renderiza com `catalog() === null`.
 *
 * Não persiste o locale aqui — isso é responsabilidade do `I18nService`.
 *
 * @example
 * providers: [provideI18n(), provideHttpClient(), ...]
 */
export function provideI18n(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LOCALE_ID,
      useFactory: (i18n: I18nService) => i18n.locale(),
      deps: [I18nService],
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const i18n = inject(I18nService);
        // Retornar a Promise faz o Angular aguardar antes de continuar o boot.
        // `bootstrap()` em paralelo carrega o catálogo e o mapa do PrimeNG
        // do locale ativo; latência típica em chunk lazy local é ~5-20ms.
        return () => i18n.bootstrap();
      },
    },
  ]);
}
