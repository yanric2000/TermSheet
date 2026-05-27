import type { TranslationKey } from '@intapp/i18n/models';

export interface BuiltInValidatorRule {
  key: TranslationKey;
  args?: (error: unknown) => readonly unknown[];
}

export const DEFAULT_VALIDATOR_MESSAGES: Record<string, BuiltInValidatorRule> = {
  required: { key: 'requiredField' },
  requiredTrue: { key: 'requiredField' },
  minlength: {
    key: 'minLength',
    args: e => [(e as { requiredLength: number }).requiredLength],
  },
  maxlength: {
    key: 'maxLength',
    args: e => [(e as { requiredLength: number }).requiredLength],
  },
  email: { key: 'invalidValue' },
  pattern: { key: 'invalidValue' },
};
