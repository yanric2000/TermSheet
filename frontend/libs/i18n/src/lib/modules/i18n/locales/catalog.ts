import type { ITranslations, Locale } from '@intapp/i18n/models';
import type { Translation as PrimeNGTranslation } from 'primeng/api';

/**
 * Loaders dos catálogos da aplicação por locale.
 *
 * Cada entrada usa `import()` dinâmico — o bundler (esbuild/webpack) gera um
 * chunk separado por locale. Resultado: o `main.js` não carrega tradução de
 * idiomas que o usuário não vai usar; a primeira navegação só baixa o locale
 * ativo (resolvido por `I18nService.bootstrap()`).
 *
 * O comentário mágico `webpackChunkName` nomeia o chunk para facilitar
 * debug no bundle report. Não afeta a semântica.
 */
export const LOCALE_LOADERS: Record<Locale, () => Promise<ITranslations>> = {
  'pt-BR': () => import('./pt-BR').then(m => m.ptBR),
  'en-US': () => import('./en-US').then(m => m.enUS),
  'es-ES': () => import('./es-ES').then(m => m.esES),
};

/**
 * Loaders das traduções do PrimeNG por locale.
 *
 * Mesmo padrão: 1 chunk por idioma para o PrimeNG. Os mapas são pequenos
 * (~1KB cada) mas evitar carregar 3x desnecessariamente já vale o
 * code-splitting consistente.
 */
export const PRIMENG_LOADERS: Record<Locale, () => Promise<PrimeNGTranslation>> = {
  'pt-BR': () => import('./primeng-pt-BR').then(m => m.PRIMENG_PT_BR),
  'en-US': () => import('./primeng-en-US').then(m => m.PRIMENG_EN_US),
  'es-ES': () => import('./primeng-es-ES').then(m => m.PRIMENG_ES_ES),
};
