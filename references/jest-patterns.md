# Jest Testing Patterns

## BDD Style (describe/it)

```typescript
describe('ModuleName', () => {
  describe('methodName', () => {
    it('should handle normal input', () => {
      expect(result).toBeDefined();
    });

    it('should handle edge cases', () => {
      expect(result).toEqual(expected);
    });
  });
});
```

## Common Matchers

- `toBe(value)` - strict equality
- `toEqual(value)` - deep equality
- `toBeDefined()` - not undefined
- `toBeUndefined()` - is undefined
- `toBeNull()` - is null
- `toBeTruthy()` / `toBeFalsy()`
- `toContain(item)` - array/string contains
- `toThrow()` - function throws
- `toHaveLength(n)` - array/string length
- `toBeInstanceOf(Class)` - instanceof check

## Async Patterns

```typescript
it('should resolve', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

it('should reject', async () => {
  await expect(asyncFunction()).rejects.toThrow();
});
```

## Setup / Teardown

```typescript
beforeEach(() => { /* reset state */ });
afterEach(() => { /* cleanup */ });
beforeAll(() => { /* one-time setup */ });
afterAll(() => { /* one-time cleanup */ });
```
