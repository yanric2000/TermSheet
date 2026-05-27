import type { JestSpyObject } from '@intapp/util/models';

type Methods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export const createJestSpyObject = <T>(methods: Array<Methods<T>>, partial?: Partial<T>): T & JestSpyObject<T> => {
  const spyObj: JestSpyObject<T> = Object.create({});

  methods.forEach(key => {
    Object.assign(spyObj, { [key]: jest.fn() });
  });

  if (partial) {
    Object.assign(spyObj, partial);
  }

  return spyObj as never;
};
