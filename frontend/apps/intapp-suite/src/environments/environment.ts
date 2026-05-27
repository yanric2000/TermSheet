/**
 * Ambiente de desenvolvimento.
 * `apiUrl: '/api'` é resolvido pelo `proxy.conf.json` que redireciona
 * para o backend Spring em `http://localhost:8080`.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  allowedDomains: ['localhost:4200', 'localhost:8080'],
};
