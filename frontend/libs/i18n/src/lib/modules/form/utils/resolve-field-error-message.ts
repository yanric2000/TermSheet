import type { AbstractControl } from '@angular/forms';
import type { TranslationKey } from '@intapp/i18n/models';
import type { I18nService } from '@intapp/i18n/services';

import { DEFAULT_VALIDATOR_MESSAGES } from './default-validator-messages';

/**
 * Resolve a mensagem de erro a ser exibida para um controle, varrendo as
 * camadas em ordem decrescente de especificidade:
 *
 *  1. Tabela built-in `DEFAULT_VALIDATOR_MESSAGES` para validators padrão
 *     do Angular (`required`, `minlength`, `maxlength`, ...). Extrai args
 *     do payload do erro e delega para `i18n.t(...)`.
 *  2. Valor cru do erro como string — para validators custom que devolvem
 *     mensagem pronta (ex.: `{ passwordStrength: 'precisa de um dígito' }`).
 *  3. `error.message` quando o erro é um objeto com campo string `message`.
 *  4. Fallback: devolve o nome do validator e dispara `console.warn`. Sinaliza
 *     que falta cadastro — comportamento idêntico ao da referência TOTVS,
 *     mas com mensagem enxuta.
 *
 * Devolve `null` quando não há erro a mostrar — sem erro no controle ou
 * antes de o usuário ter tocado o campo. O caller usa esse retorno para
 * esconder a UI de erro.
 *
 * Por que ler só o primeiro erro de `Object.entries(errors)[0]`:
 *  - Mantém paridade com a `resolveControlError` original do `LoginComponent`,
 *    que também só exibia uma mensagem por vez.
 *  - Concatenar todos os erros (joining por `; `) é uma melhoria futura
 *    natural — basta trocar essa função sem tocar a diretiva.
 */
export function resolveFieldErrorMessage(control: AbstractControl, i18n: I18nService): string | null {
  if (!control.touched || !control.errors) return null;
  const entries = Object.entries(control.errors);
  if (entries.length === 0) return null;

  const [errorKey, errorValue] = entries[0];

  const builtIn = DEFAULT_VALIDATOR_MESSAGES[errorKey];
  if (builtIn) {
    const args = builtIn.args?.(errorValue) ?? [];
    // O cast é seguro: `builtIn.key` é uma `TranslationKey` literal e os
    // args da tabela built-in são gerados sob medida para cada chave. A
    // tipagem variável de `t<K>` exige tupla específica por chave — o cast
    // canaliza isso sem propagar a complexidade para o consumer.
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

  console.warn(`[I18nFieldError] Sem tradução para o validator "${errorKey}".`);
  return errorKey;
}
