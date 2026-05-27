/// <reference types="jest" />

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any[]) => any;

export type JestSpyObject<T> = T & {
  [K in keyof T]: T[K] extends Func ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>> : T[K];
};
