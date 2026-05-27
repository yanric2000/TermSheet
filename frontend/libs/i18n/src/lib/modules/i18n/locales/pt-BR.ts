import type { ITranslations } from '../models/i18n.models';

export const ptBR = {
  requiredField: 'Campo obrigatório',
  minLength: 'Mínimo de {0} caracteres',
  maxLength: 'Máximo de {0} caracteres',
  invalidValue: 'Valor inválido',

  productName: 'TermSheet',
  productTagline: 'Negócios imobiliários',

  loginSubtitle: 'Entre na sua conta para continuar',
  loginUsernameLabel: 'Usuário',
  loginPasswordLabel: 'Senha',
  loginSubmit: 'Entrar',

  apiErrorToastTitle: 'Erro',
  apiErrorNoNetwork: 'Sem conexão com o servidor',
  apiErrorUnauthorized: 'Acesso não autorizado',
  apiErrorUnexpected: 'Erro inesperado',

  dealsTitle: 'Deals',
  dealsGreeting: 'Olá, {0}',
  dealsLogout: 'Sair',
  dealsColumnName: 'Nome',
  dealsColumnPurchasePrice: 'Preço de compra',
  dealsColumnAddress: 'Endereço',
  dealsColumnNoi: 'ROL',
  dealsColumnCapRate: 'Taxa de capitalização',
  dealsFilterSearchPlaceholder: 'Buscar por nome…',
  dealsFilterOperatorLabel: 'Filtrar preço',
  dealsFilterOperatorGte: 'Maior ou igual a',
  dealsFilterOperatorLte: 'Menor ou igual a',
  dealsFilterPricePlaceholder: 'Valor',
  dealsFilterClear: 'Limpar filtros',
  dealsEmpty: 'Nenhum deal encontrado',
  dealsCreateButton: 'Novo deal',
  dealsCreateDialogTitle: 'Cadastrar deal',
  dealsCreateSubmit: 'Salvar',
  dealsCreateCancel: 'Cancelar',
  dealsFieldDescription: 'Descrição',

  pageTitleLogin: 'Login',
} as const satisfies ITranslations;
