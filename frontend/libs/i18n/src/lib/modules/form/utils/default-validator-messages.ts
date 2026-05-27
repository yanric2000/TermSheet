import type { TranslationKey } from '@intapp/i18n/models';

/**
 * Descreve como traduzir um erro de validator padrão do Angular:
 *  - `key`: chave do catálogo i18n que carrega a mensagem.
 *  - `args`: opcional, extrai os placeholders da string a partir do payload
 *    do erro (ex.: `requiredLength` de `minlength` vira o `{0}` da chave
 *    `minLength`). Quando ausente, a mensagem não tem placeholders.
 *
 * Tipado em torno de `TranslationKey` para que typos virem erro de
 * compilação no próprio arquivo.
 */
export interface BuiltInValidatorRule {
  key: TranslationKey;
  args?: (error: unknown) => readonly unknown[];
}

/**
 * Tabela built-in que mapeia chaves de erro dos validators padrão do
 * Angular para chaves do catálogo i18n da aplicação.
 *
 * Decisão: cobrimos apenas validators "core" do `Validators.*`. Validators
 * custom (ex.: `passwordStrength`) devem devolver a mensagem pronta — como
 * string crua ou objeto `{ message: string }` — e o `resolveFieldErrorMessage`
 * extrai daí, sem precisar tocar essa tabela.
 *
 * Casts `(e as { requiredLength: number })`: o Angular tipa `errors[key]`
 * como `any`. Os extratores ficam isolados aqui, longe do consumer.
 */
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
