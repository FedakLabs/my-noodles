import { AsyncLocalStorage } from 'node:async_hooks';

export class Context<T> {
  constructor(
    private readonly storage: AsyncLocalStorage<T>,
    public readonly name: string,
    private readonly defaultValue?: T,
  ) {}

  run<R>(value: T, fn: () => R): R {
    return this.storage.run(value, fn);
  }

  set(value: T, { onlyIfEmpty = false } = {}): void {
    if (!onlyIfEmpty || this.storage.getStore() === undefined) {
      this.storage.enterWith(value);
    }
  }

  public get(): T;
  public get(options: { silent: true; defaultValue?: undefined }): T | null;
  public get<D = T>(options: { silent?: false; defaultValue: D }): T | D;
  public get<D = T>(options: { silent: true; defaultValue: D }): T | D | null;
  public get<D = T>(props?: { silent?: boolean; defaultValue?: D }): T | D | null {
    const silent = props?.silent ?? false;
    const defaultValue = props?.defaultValue ?? this.defaultValue;

    const value = this.storage.getStore();

    if (value === undefined && !silent && defaultValue === undefined) {
      throw new Error(`A value for context ${this.name} was not provided!`);
    }

    return value ?? defaultValue ?? null;
  }
}

const globalContexts: Record<string, Context<unknown>> = {};

export function createContext<T>(name: string, defaultValue?: T): Context<T> {
  if (globalContexts[name]) {
    throw new Error(`A context with name ${name} already exists`);
  }

  const storage = new AsyncLocalStorage<T>();
  const context = new Context(storage, name, defaultValue);
  globalContexts[name] = context;

  return context;
}
