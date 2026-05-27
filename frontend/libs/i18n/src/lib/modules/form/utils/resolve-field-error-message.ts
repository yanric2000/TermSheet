import type { AbstractControl } from '@angular/forms';
import type { TranslationKey } from '@intapp/i18n/models';
import type { I18nService } from '@intapp/i18n/services';

import { DEFAULT_VALIDATOR_MESSAGES } from './default-validator-messages';

export function resolveFieldErrorMessage(control: AbstractControl, i18n: I18nService): string | null {
  if (!control.touched || !control.errors) return null;
  const entries = Object.entries(control.errors);
  if (entries.length === 0) return null;

  const [errorKey, errorValue] = entries[0];

  const builtIn = DEFAULT_VALIDATOR_MESSAGES[errorKey];
  if (builtIn) {
    const args = builtIn.args?.(errorValue) ?? [];

    return (i18n.t as (k: TranslationKey, ...a: readonly unknown[]) => string)(builtIn.key, ...args);
  }

  if (typeof errorValue === 'string') return errorValue;

  if (
    errorValue !== null &&
    typeof errorValue === 'object' &&
    typeof (errorValue as { message?: unknown }).message === 'string'
  ) {
    return (errorValue as { message: string }).message;
  }

  console.warn(`[I18nFieldError] No translation for validator "${errorKey}".`);
  return errorKey;
}
