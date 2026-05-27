import type { ITranslations } from '../models/i18n.models';

/**
 * Locale pt-BR — source da verdade do dicionário.
 *
 * Padrão:
 *  - Chaves planas em `camelCase`. Nada de pontuação ou objetos aninhados.
 *  - Strings com placeholders posicionais `{0}`, `{1}`, ... no lugar de funções.
 *    O `I18nService.t(...)` substitui esses tokens em tempo de execução, e a
 *    quantidade/posição é inferida em tempo de compilação a partir dessas
 *    strings literais (ver `i18n.models.ts`).
 *
 * `as const satisfies ITranslations`:
 *  - `as const` preserva os tipos literais das strings para que
 *    `CountPlaceholders<typeof ptBR[K]>` consiga ler `{0}` / `{1}` em tempo
 *    de compilação e derivar a tupla de args.
 *  - `satisfies ITranslations` valida que `ptBR` cumpre o contrato declarado
 *    sem alargar os literais para `string`. Chave faltando ou extra aqui
 *    vira erro do compilador no próprio ponto da declaração.
 *
 * Os demais locales (`en-US`, `es-ES`) são anotados diretamente como
 * `: ITranslations` — herdam apenas a estrutura, sem precisar repetir
 * os literais. A contagem de placeholders sempre vem deste arquivo.
 *
 * Quando adicionar uma chave nova: declare-a em `ITranslations` primeiro,
 * depois preencha-a aqui e nos demais locales. O compilador aponta as faltas
 * em todos os `i18n.t(...)` da aplicação.
 */
export const ptBR = {
  // common — mensagens compartilhadas (form validation, fallback genérico)
  requiredField: 'Campo obrigatório',
  minLength: 'Mínimo de {0} caracteres',
  maxLength: 'Máximo de {0} caracteres',
  invalidValue: 'Valor inválido',

  // branding — produto, exibido em títulos e footer
  productName: 'TermSheet',
  productTagline: 'Real Estate Deals',

  // auth — tela de login
  loginSubtitle: 'Entre na sua conta para continuar',
  loginUsernameLabel: 'Usuário',
  loginPasswordLabel: 'Senha',
  loginSubmit: 'Entrar',

  // API errors — fallbacks usados pelo `apiErrorToastInterceptor` quando o
  // backend não retorna um `message` no payload.
  apiErrorToastTitle: 'Erro',
  apiErrorNoNetwork: 'Sem conexão com o servidor',
  apiErrorUnauthorized: 'Acesso não autorizado',
  apiErrorUnexpected: 'Erro inesperado',

  // termsheet — listagem de deals
  dealsTitle: 'Deals',
  dealsGreeting: 'Olá, {0}',
  dealsLogout: 'Sair',
  dealsColumnName: 'Nome',
  dealsColumnPurchasePrice: 'Preço de compra',
  dealsColumnAddress: 'Endereço',
  dealsColumnNoi: 'NOI',
  dealsColumnCapRate: 'Cap rate',
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

  // page titles — consumidos pelo `I18nService.pageTitle(...)` em resolvers de rota
  pageTitleLogin: 'Login',
  pageTitleDeals: 'Deals',
} as const satisfies ITranslations;
