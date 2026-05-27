/**
 * Ambiente de produção.
 * Em produção, o front e o backend devem estar atrás do mesmo domínio
 * (ou com CORS + cookie cross-site adequados). `apiUrl: '/api'` assume
 * mesma origem; ajuste para URL absoluta se forem domínios diferentes.
 */
export const environment = {
  production: true,
  apiUrl: '/api',
  allowedDomains: [],
};
