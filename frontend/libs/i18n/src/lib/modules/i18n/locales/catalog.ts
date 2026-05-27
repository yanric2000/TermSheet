import type { ITranslations, Locale } from '@intapp/i18n/models';
import type { Translation as PrimeNGTranslation } from 'primeng/api';

export const LOCALE_LOADERS: Record<Locale, () => Promise<ITranslations>> = {
  'pt-BR': () => import('./pt-BR').then(m => m.ptBR),
  'en-US': () => import('./en-US').then(m => m.enUS),
  'es-ES': () => import('./es-ES').then(m => m.esES),
};

export const PRIMENG_LOADERS: Record<Locale, () => Promise<PrimeNGTranslation>> = {
  'pt-BR': () => import('./primeng-pt-BR').then(m => m.PRIMENG_PT_BR),
  'en-US': () => import('./primeng-en-US').then(m => m.PRIMENG_EN_US),
  'es-ES': () => import('./primeng-es-ES').then(m => m.PRIMENG_ES_ES),
};
