/**
 * Endpoints da API de Deals.
 *
 * Centralizar URLs aqui evita strings duplicadas em facades de infra.
 * Caminhos são relativos ao `apiUrl` configurado em `provideAuth` (geralmente `/api`).
 */
export const constants = {
  deals: 'deals',
} as const;
