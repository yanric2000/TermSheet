import { signal } from '@angular/core';
import type { Provider } from '@angular/core';
import type { ITranslations, Locale, TranslationKey } from '@intapp/i18n/models';
import { I18nService } from '@intapp/i18n/services';
import { formatTemplate } from '@intapp/i18n/utils';
import { createJestSpyObject } from '@intapp/util/jest';
import type { JestSpyObject } from '@intapp/util/models';

import { ptBR } from '../modules/i18n/locales/pt-BR';

export const i18nServiceMockFactory = (catalog: ITranslations = ptBR): JestSpyObject<I18nService> => {
  const locale = signal<Locale>('pt-BR');
  const catalogSignal = signal<ITranslations>(catalog);

  const mock = createJestSpyObject<I18nService>(['bootstrap', 'setLocale', 't', 'pageTitle'], {
    locale: locale.asReadonly(),
    catalog: catalogSignal.asReadonly(),
  });

  mock.t.mockImplementation(<K extends TranslationKey>(key: K, ...args: (string | number)[]) => {
    const template = catalog[key];
    return formatTemplate(template, args);
  });

  mock.pageTitle.mockImplementation(<K extends TranslationKey>(key: K, ...args: string[]) => {
    const section = mock.t(key, ...args);
    return `${mock.t('productName')} · ${section}`;
  });

  mock.setLocale.mockResolvedValue(undefined);
  mock.bootstrap.mockResolvedValue(undefined);

  return mock;
};

export const i18nServiceProviderFactory = (catalog?: ITranslations) =>
  ({
    provide: I18nService,
    useValue: i18nServiceMockFactory(catalog ?? ptBR),
  }) satisfies Provider;
