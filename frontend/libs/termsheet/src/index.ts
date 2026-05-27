/**
 * API pública da `@intapp/termsheet`.
 *
 * Mantém deliberadamente uma superfície enxuta: o app host só conhece
 * `termsheetRoutes`. Tudo o mais (features, modules de subdomínio, facades,
 * adapters, etc.) é detalhe interno e pode ser reorganizado sem quebrar
 * consumidores externos.
 */
export { termsheetRoutes } from './lib/features/termsheet.routes';
