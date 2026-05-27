import type { ITranslations } from '../models/i18n.models';

/**
 * Locale es-ES. A anotação `: ITranslations` exige paridade estrutural com
 * o contrato (todas as chaves obrigatórias, cada valor `string`) sem precisar
 * repetir os literais — drift de chaves vira erro de build.
 *
 * Placeholders `{0}`, `{1}`, ... seguem a mesma ordem do ptBR para que o
 * mesmo `t('key', arg0, arg1)` funcione em qualquer idioma.
 */
export const esES: ITranslations = {
  // common
  requiredField: 'Campo obligatorio',
  minLength: 'Mínimo de {0} caracteres',
  maxLength: 'Máximo de {0} caracteres',
  invalidValue: 'Valor inválido',

  // branding
  productName: 'TermSheet',
  productTagline: 'Real Estate Deals',

  // auth — login
  loginSubtitle: 'Inicia sesión en tu cuenta para continuar',
  loginUsernameLabel: 'Usuario',
  loginPasswordLabel: 'Contraseña',
  loginSubmit: 'Iniciar sesión',

  // API errors — fallbacks usados por `apiErrorToastInterceptor`.
  apiErrorToastTitle: 'Error',
  apiErrorNoNetwork: 'Sin conexión con el servidor',
  apiErrorUnauthorized: 'Acceso no autorizado',
  apiErrorUnexpected: 'Error inesperado',

  // termsheet — deals
  dealsTitle: 'Deals',
  dealsGreeting: 'Hola, {0}',
  dealsLogout: 'Cerrar sesión',
  dealsColumnName: 'Nombre',
  dealsColumnPurchasePrice: 'Precio de compra',
  dealsColumnAddress: 'Dirección',
  dealsColumnNoi: 'NOI',
  dealsColumnCapRate: 'Cap rate',
  dealsFilterSearchPlaceholder: 'Buscar por nombre…',
  dealsFilterOperatorLabel: 'Filtrar precio',
  dealsFilterOperatorGte: 'Mayor o igual a',
  dealsFilterOperatorLte: 'Menor o igual a',
  dealsFilterPricePlaceholder: 'Valor',
  dealsFilterClear: 'Limpiar filtros',
  dealsEmpty: 'No se encontraron deals',

  // page titles
  pageTitleLogin: 'Iniciar sesión',
  pageTitleDeals: 'Deals',
};
