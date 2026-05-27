/**
 * Contrato do dicionário de traduções da aplicação.
 *
 * Listada explicitamente (em vez de derivada com `mapped type` de `typeof ptBR`)
 * para servir como contrato visível e versionado da camada de i18n:
 *  - Code review: novas chaves são adicionadas conscientemente aqui antes
 *    de aparecer em locale algum.
 *  - Tooling/auto-complete: o consumidor (`i18n.t(...)`) vê o tipo explicitamente
 *    sem precisar resolver inferências profundas.
 *  - Documentação: cada bloco de chaves é agrupado por feature, com comentário
 *    descrevendo onde é usado — o arquivo é a "tabela de conteúdos" do i18n.
 *
 * O `ptBR` (em `../locales/pt-BR.ts`) usa `as const satisfies ITranslations`:
 *  - `as const` preserva os tipos literais das strings para que
 *    `CountPlaceholders<typeof ptBR[K]>` consiga ler `{0}` / `{1}` em tempo
 *    de compilação e derivar a tupla de args.
 *  - `satisfies ITranslations` valida que `ptBR` cumpre este contrato sem
 *    alargar os literais.
 *
 * `en-US` e `es-ES` anotam diretamente `: ITranslations` — não precisam
 * preservar literais (a contagem de placeholders vem do `ptBR`), só garantir
 * estrutura idêntica.
 */
export interface ITranslations {
  // common — mensagens compartilhadas (form validation, fallback genérico)
  requiredField: string;
  minLength: string;
  maxLength: string;
  invalidValue: string;

  // branding — produto, exibido em títulos e footer
  productName: string;
  productTagline: string;

  // auth — tela de login
  loginSubtitle: string;
  loginUsernameLabel: string;
  loginPasswordLabel: string;
  loginSubmit: string;

  // API errors — fallbacks consumidos pelo `apiErrorToastInterceptor`
  // quando o backend não devolve um payload com `message`. Genéricos por
  // intenção: o interceptor é compartilhado por todas as features.
  apiErrorToastTitle: string;
  apiErrorNoNetwork: string;
  apiErrorUnauthorized: string;
  apiErrorUnexpected: string;

  // termsheet — listagem de deals
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

  // page titles — consumidos pelo `I18nService.pageTitle(...)` em resolvers de rota
  pageTitleLogin: string;
  pageTitleDeals: string;
}

/**
 * União dos identificadores válidos para `I18nService.t(...)`.
 * Derivada do contrato `ITranslations` — typos viram erro de compilação.
 */
export type TranslationKey = keyof ITranslations;

/**
 * Conta `{0}`, `{1}`, ... em um literal string e devolve uma tupla com um
 * slot `string | number` por placeholder.
 */
type CountPlaceholders<S extends string, Acc extends unknown[] = []> = S extends `${string}{${number}}${infer Rest}`
  ? CountPlaceholders<Rest, [...Acc, string | number]>
  : Acc;

/**
 * Tupla de argumentos que `t(key, ...)` exige para uma chave específica.
 */
export type TranslationArgs<K extends TranslationKey> = CountPlaceholders<ITranslations[K]>;

/**
 * Códigos BCP 47 dos idiomas suportados. União literal em vez de `string`
 * para que `setLocale(...)` e providers rejeitem locales não suportados.
 */
export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Lista canônica dos idiomas suportados, na ordem em que devem aparecer em
 * um eventual seletor. `readonly` evita mutação acidental.
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['pt-BR', 'en-US', 'es-ES'] as const;

/** Chave do localStorage onde a preferência do usuário é persistida. */
export const LOCALE_STORAGE_KEY = 'intapp:locale';

/** Locale padrão quando não há preferência salva nem match com o navegador. */
export const DEFAULT_LOCALE: Locale = 'pt-BR';
