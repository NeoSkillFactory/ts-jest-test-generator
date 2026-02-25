import { analyzeSourceFile } from './analyzer';

describe('analyzeSourceFile', () => {
  describe('function extraction', () => {
    it('should extract a simple exported function', () => {
      const code = `export function add(a: number, b: number): number { return a + b; }`;
      const result = analyzeSourceFile(code, 'math.ts');

      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('add');
      expect(result.functions[0].isExported).toBe(true);
      expect(result.functions[0].isAsync).toBe(false);
      expect(result.functions[0].params).toHaveLength(2);
      expect(result.functions[0].params[0].name).toBe('a');
      expect(result.functions[0].params[0].type).toBe('number');
      expect(result.functions[0].returnType).toBe('number');
    });

    it('should extract a non-exported function', () => {
      const code = `function helper(): void {}`;
      const result = analyzeSourceFile(code, 'util.ts');

      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('helper');
      expect(result.functions[0].isExported).toBe(false);
    });

    it('should extract an async function', () => {
      const code = `export async function fetchData(url: string): Promise<string> { return ''; }`;
      const result = analyzeSourceFile(code, 'api.ts');

      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].isAsync).toBe(true);
      expect(result.functions[0].returnType).toBe('Promise<string>');
    });

    it('should extract arrow functions assigned to const', () => {
      const code = `export const multiply = (a: number, b: number): number => a * b;`;
      const result = analyzeSourceFile(code, 'math.ts');

      expect(result.functions).toHaveLength(1);
      expect(result.functions[0].name).toBe('multiply');
      expect(result.functions[0].params).toHaveLength(2);
    });

    it('should handle optional parameters', () => {
      const code = `export function greet(name: string, prefix?: string): string { return name; }`;
      const result = analyzeSourceFile(code, 'greet.ts');

      expect(result.functions[0].params).toHaveLength(2);
      expect(result.functions[0].params[1].optional).toBe(true);
    });

    it('should handle default parameters', () => {
      const code = `export function repeat(str: string, count: number = 1): string { return str; }`;
      const result = analyzeSourceFile(code, 'str.ts');

      expect(result.functions[0].params[1].hasDefault).toBe(true);
    });

    it('should return empty arrays for empty files', () => {
      const result = analyzeSourceFile('', 'empty.ts');
      expect(result.functions).toHaveLength(0);
      expect(result.classes).toHaveLength(0);
      expect(result.interfaces).toHaveLength(0);
    });
  });

  describe('class extraction', () => {
    it('should extract a class with constructor and methods', () => {
      const code = `
export class Calculator {
  constructor(private precision: number) {}
  add(a: number, b: number): number { return a + b; }
  private reset(): void {}
}`;
      const result = analyzeSourceFile(code, 'calc.ts');

      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].className).toBe('Calculator');
      expect(result.classes[0].isExported).toBe(true);
      expect(result.classes[0].constructorParams).toHaveLength(1);
      expect(result.classes[0].methods).toHaveLength(2);

      const addMethod = result.classes[0].methods.find((m) => m.name === 'add');
      expect(addMethod).toBeDefined();
      expect(addMethod!.visibility).toBe('public');

      const resetMethod = result.classes[0].methods.find((m) => m.name === 'reset');
      expect(resetMethod).toBeDefined();
      expect(resetMethod!.visibility).toBe('private');
    });

    it('should detect static methods', () => {
      const code = `
export class Utils {
  static format(val: string): string { return val; }
}`;
      const result = analyzeSourceFile(code, 'utils.ts');

      expect(result.classes[0].methods[0].isStatic).toBe(true);
    });

    it('should detect async methods', () => {
      const code = `
export class Service {
  async fetch(id: string): Promise<any> { return null; }
}`;
      const result = analyzeSourceFile(code, 'svc.ts');

      expect(result.classes[0].methods[0].isAsync).toBe(true);
    });
  });

  describe('interface extraction', () => {
    it('should extract interface properties', () => {
      const code = `
export interface Config {
  host: string;
  port: number;
  debug?: boolean;
}`;
      const result = analyzeSourceFile(code, 'config.ts');

      expect(result.interfaces).toHaveLength(1);
      expect(result.interfaces[0].name).toBe('Config');
      expect(result.interfaces[0].properties).toHaveLength(3);

      const host = result.interfaces[0].properties.find((p) => p.name === 'host');
      expect(host!.type).toBe('string');
      expect(host!.optional).toBe(false);

      const debug = result.interfaces[0].properties.find((p) => p.name === 'debug');
      expect(debug!.optional).toBe(true);
    });
  });

  describe('mixed file', () => {
    it('should extract functions, classes, and interfaces from one file', () => {
      const code = `
export function hello(): string { return 'hi'; }
export class Greeter { greet(): string { return 'hi'; } }
export interface Greeting { message: string; }
`;
      const result = analyzeSourceFile(code, 'mixed.ts');

      expect(result.functions).toHaveLength(1);
      expect(result.classes).toHaveLength(1);
      expect(result.interfaces).toHaveLength(1);
    });
  });
});
