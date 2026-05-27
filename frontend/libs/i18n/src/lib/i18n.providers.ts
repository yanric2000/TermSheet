import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import { APP_INITIALIZER, EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders, inject } from '@angular/core';
import { I18nService } from '@intapp/i18n/services';

registerLocaleData(localePt);
registerLocaleData(localeEs);

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

        return () => i18n.bootstrap();
      },
    },
  ]);
}
