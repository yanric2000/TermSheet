/**
 * API pública da `libs/i18n`.
 *
 * Apenas o que precisa ser consumido por outras libs/apps é exportado aqui.
 * Detalhes internos (catálogo, loaders, mapas do PrimeNG, locales individuais)
 * ficam confinados a `./lib/modules/i18n/**` e podem ser refatorados sem
 * quebrar consumidores externos.
 */
export { provideI18n } from './lib/i18n.providers';
export { I18nService } from './lib/modules/i18n/services/i18n.service';
export type { ITranslations, Locale, TranslationArgs, TranslationKey } from './lib/modules/i18n/models/i18n.models';
export { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from './lib/modules/i18n/models/i18n.models';

// form — diretiva e componente para mensagens de erro de validação
// i18n-aware. Auto-aplica `<p-message>` a campos com
// `formControlName`/`[formControl]` sem boilerplate no template.
export { I18nFieldErrorDirective } from './lib/modules/form/directives/i18n-field-error.directive';
export { I18nFieldErrorComponent } from './lib/modules/form/components/i18n-field-error.component';
