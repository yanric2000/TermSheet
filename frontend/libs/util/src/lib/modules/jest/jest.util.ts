import type { ObjetoEspiaoJest } from '@intapp/util/models';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Methods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export const criarObjetoEspiaoJest = <T>(
  metodos: Array<Methods<T>>,
  objetoParcial?: Partial<T>,
): T & ObjetoEspiaoJest<T> => {
  const spyObj: ObjetoEspiaoJest<T> = Object.create({});

  metodos.forEach(chave => {
    Object.assign(spyObj, { [chave]: jest.fn() });
  });

  if (objetoParcial) {
    Object.assign(spyObj, objetoParcial);
  }

  return spyObj as never;
};
