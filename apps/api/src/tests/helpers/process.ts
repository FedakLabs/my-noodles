import { jest } from '../jest-globals';

export function mockProcessExit(): jest.SpiedFunction<(code?: string | number | null) => never> {
  return jest.spyOn(process, 'exit').mockImplementation(((/* code */) => undefined) as never);
}
