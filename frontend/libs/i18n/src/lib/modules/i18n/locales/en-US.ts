import type { ITranslations } from '../models/i18n.models';

/**
 * Locale en-US. A anotação `: ITranslations` exige paridade estrutural com
 * o contrato (todas as chaves obrigatórias, cada valor `string`) sem precisar
 * repetir os literais — drift de chaves vira erro de build.
 *
 * Placeholders `{0}`, `{1}`, ... seguem a mesma ordem do ptBR para que o
 * mesmo `t('key', arg0, arg1)` funcione em qualquer idioma.
 */
export const enUS: ITranslations = {
  // common
  requiredField: 'Required field',
  minLength: 'Minimum of {0} characters',
  maxLength: 'Maximum of {0} characters',
  invalidValue: 'Invalid value',

  // branding
  productName: 'TermSheet',
  productTagline: 'Real Estate Deals',

  // auth — login
  loginSubtitle: 'Sign in to your account to continue',
  loginUsernameLabel: 'Username',
  loginPasswordLabel: 'Password',
  loginSubmit: 'Sign in',

  // API errors — fallbacks used by `apiErrorToastInterceptor`.
  apiErrorToastTitle: 'Error',
  apiErrorNoNetwork: 'Cannot reach the server',
  apiErrorUnauthorized: 'Unauthorized access',
  apiErrorUnexpected: 'Unexpected error',

  // termsheet — deals
  dealsTitle: 'Deals',
  dealsGreeting: 'Hello, {0}',
  dealsLogout: 'Sign out',
  dealsPlaceholderMessage: 'Authentication is working. The deals list will be implemented in the next step.',

  // page titles
  pageTitleLogin: 'Sign in',
  pageTitleDeals: 'Deals',
};
