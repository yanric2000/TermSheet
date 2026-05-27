import type { ITranslations } from '../models/i18n.models';

export const enUS: ITranslations = {
  requiredField: 'Required field',
  minLength: 'Minimum of {0} characters',
  maxLength: 'Maximum of {0} characters',
  invalidValue: 'Invalid value',

  productName: 'TermSheet',
  productTagline: 'Real Estate Deals',

  loginSubtitle: 'Sign in to your account to continue',
  loginUsernameLabel: 'Username',
  loginPasswordLabel: 'Password',
  loginSubmit: 'Sign in',

  apiErrorToastTitle: 'Error',
  apiErrorNoNetwork: 'Cannot reach the server',
  apiErrorUnauthorized: 'Unauthorized access',
  apiErrorUnexpected: 'Unexpected error',

  dealsTitle: 'Deals',
  dealsGreeting: 'Hello, {0}',
  dealsLogout: 'Sign out',
  dealsColumnName: 'Name',
  dealsColumnPurchasePrice: 'Purchase price',
  dealsColumnAddress: 'Address',
  dealsColumnNoi: 'NOI',
  dealsColumnCapRate: 'Cap rate',
  dealsFilterSearchPlaceholder: 'Search by name…',
  dealsFilterOperatorLabel: 'Filter price',
  dealsFilterOperatorGte: 'Greater than or equal to',
  dealsFilterOperatorLte: 'Less than or equal to',
  dealsFilterPricePlaceholder: 'Amount',
  dealsFilterClear: 'Clear filters',
  dealsEmpty: 'No deals found',
  dealsCreateButton: 'New deal',
  dealsCreateDialogTitle: 'Create deal',
  dealsCreateSubmit: 'Save',
  dealsCreateCancel: 'Cancel',
  dealsFieldDescription: 'Description',

  pageTitleLogin: 'Sign in',
};
