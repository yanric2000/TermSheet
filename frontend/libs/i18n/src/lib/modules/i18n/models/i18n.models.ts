export interface ITranslations {
  requiredField: string;
  minLength: string;
  maxLength: string;
  invalidValue: string;
  productName: string;
  productTagline: string;
  loginSubtitle: string;
  loginUsernameLabel: string;
  loginPasswordLabel: string;
  loginSubmit: string;
  apiErrorToastTitle: string;
  apiErrorNoNetwork: string;
  apiErrorUnauthorized: string;
  apiErrorUnexpected: string;
  dealsTitle: string;
  dealsGreeting: string;
  dealsLogout: string;
  dealsColumnName: string;
  dealsColumnPurchasePrice: string;
  dealsColumnAddress: string;
  dealsColumnNoi: string;
  dealsColumnCapRate: string;
  dealsFilterSearchPlaceholder: string;
  dealsFilterOperatorLabel: string;
  dealsFilterOperatorGte: string;
  dealsFilterOperatorLte: string;
  dealsFilterPricePlaceholder: string;
  dealsFilterClear: string;
  dealsEmpty: string;
  dealsCreateButton: string;
  dealsCreateDialogTitle: string;
  dealsCreateSubmit: string;
  dealsCreateCancel: string;
  dealsFieldDescription: string;
  pageTitleLogin: string;
}

export type TranslationKey = keyof ITranslations;

type CountPlaceholders<S extends string, Acc extends unknown[] = []> = S extends `${string}{${number}}${infer Rest}`
  ? CountPlaceholders<Rest, [...Acc, string | number]>
  : Acc;

export type TranslationArgs<K extends TranslationKey> = CountPlaceholders<ITranslations[K]>;

export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

export const SUPPORTED_LOCALES: readonly Locale[] = ['pt-BR', 'en-US', 'es-ES'] as const;

export const LOCALE_STORAGE_KEY = 'intapp:locale';

export const DEFAULT_LOCALE: Locale = 'pt-BR';
