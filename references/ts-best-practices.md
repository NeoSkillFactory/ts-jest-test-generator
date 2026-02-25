# TypeScript Patterns for Test Generation

## Function Patterns

### Regular exported function
```typescript
export function add(a: number, b: number): number {
  return a + b;
}
```

### Arrow function
```typescript
export const multiply = (a: number, b: number): number => a * b;
```

### Async function
```typescript
export async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}
```

## Class Patterns

### Basic class with constructor
```typescript
export class UserService {
  constructor(private db: Database) {}

  async getUser(id: string): Promise<User> {
    return this.db.findById(id);
  }
}
```

### Class with static methods
```typescript
export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
```

## Interface Patterns

### Simple interface
```typescript
export interface Config {
  host: string;
  port: number;
  debug?: boolean;
}
```

### Interface with complex types
```typescript
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
}
```

## Test Mapping Strategy

| TS Construct | Test Pattern |
|---|---|
| Exported function | describe + it with mock args |
| Async function | async it with await |
| Class | describe with beforeEach instance creation |
| Public method | Nested describe + it |
| Interface | Shape validation test |
| Static method | Direct class.method call |
