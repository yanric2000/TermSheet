import { Injectable } from '@angular/core';

/**
 * Abstração mínima sobre `window.localStorage`.
 *
 * Decisões de design:
 *  - **Chave `string`, generic só no retorno.** A "tipagem" é uma promessa do
 *    caller: ele escreve `set<Foo>` e lê `get<Foo>` e assume a equivalência.
 *    Adequado para um produto onde controlamos os dois lados do read/write.
 *    Validação de shape em runtime, quando necessária, é responsabilidade do
 *    consumidor (ex.: `I18nService` valida contra `SUPPORTED_LOCALES` no read).
 *  - **`JSON.parse`/`stringify` automáticos.** Encapsula a única estratégia
 *    de serialização que faz sentido para um storage que só guarda strings.
 *  - **`get` retorna `null` apenas quando a chave não existe.** Qualquer
 *    outro caminho (storage bloqueado, valor corrompido, quota excedida) joga
 *    exceção — escolha consciente para não silenciar problemas reais.
 *  - **`window.localStorage` direto, sem `inject(DOCUMENT)`.** Trade-off
 *    aceito: produto é SPA pura, sem SSR no horizonte. Em troca, o service
 *    fica trivial (zero deps).
 *  - **Sem `try/catch`.** Erros propagam para quem chamou.
 */
@Injectable({ providedIn: 'root' })
export class BrowserStorageService {
  /**
   * Lê e desserializa o valor associado a `key`.
   *
   * Retorna `null` quando a chave não existe. Para outros caminhos de erro
   * (JSON inválido, `localStorage` indisponível) a exceção propaga.
   */
  get<T>(key: string): T | null {
    const raw = window.localStorage.getItem(key);
    return !raw ? null : JSON.parse(raw);
  }

  /**
   * Serializa `value` via `JSON.stringify` e grava em `localStorage`.
   *
   * Falhas (quota excedida, modo anônimo bloqueado) propagam para o caller.
   */
  set<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  /** Remove a chave. No-op se ela não existir. */
  remove(key: string): void {
    window.localStorage.removeItem(key);
  }
}
