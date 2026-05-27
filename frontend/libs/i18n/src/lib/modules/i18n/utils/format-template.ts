/**
 * Substitui placeholders posicionais `{0}`, `{1}`, ... no template por valores
 * de `args[N]`.
 *
 * Regras:
 *  - Argumentos `undefined` / `null` viram string vazia (defensivo — evita
 *    "undefined" aparecendo na UI quando alguém esquece de passar um arg).
 *  - Demais valores passam por `String(...)` para suportar `number`, `Date`,
 *    etc.
 *  - Aceita o mesmo placeholder repetido (`{0}` mais de uma vez) e em ordem
 *    arbitrária (`'{1} {0}'`).
 *
 * Implementação enxuta com `replace` + regex. Não há necessidade de
 * tokenização/AST: o universo de strings é controlado (vive em locales
 * versionados) e o overhead de regex em strings curtas é desprezível.
 */
export function formatTemplate(template: string, args: readonly unknown[]): string {
  if (args.length === 0) return template;
  return template.replace(/\{(\d+)\}/g, (_, index: string) => {
    const value = args[Number(index)];
    return value === undefined || value === null ? '' : String(value);
  });
}
