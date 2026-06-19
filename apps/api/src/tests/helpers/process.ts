export function mockProcessExit(): jest.SpiedFunction<(code?: string | number | null) => never> {
  return jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
}
