import { analyzeSourceFile } from './analyzer';
import { generateTests } from './generator';

describe('generateTests', () => {
  it('should generate test code for a simple function', () => {
    const code = `export function add(a: number, b: number): number { return a + b; }`;
    const analysis = analyzeSourceFile(code, 'math.ts');
    const result = generateTests(analysis);

    expect(result.suiteCount).toBe(1);
    expect(result.testFileName).toContain('math.test.ts');
    expect(result.testCode).toContain("import { add } from './math'");
    expect(result.testCode).toContain("describe('add'");
    expect(result.testCode).toContain('expect(result).toBeDefined()');
  });

  it('should generate test code for an async function', () => {
    const code = `export async function fetchData(url: string): Promise<string> { return ''; }`;
    const analysis = analyzeSourceFile(code, 'api.ts');
    const result = generateTests(analysis);

    expect(result.testCode).toContain('async');
    expect(result.testCode).toContain('await fetchData');
  });

  it('should generate test code for a class with methods', () => {
    const code = `
export class Service {
  constructor(private db: any) {}
  async getItem(id: string): Promise<any> { return null; }
  count(): number { return 0; }
}`;
    const analysis = analyzeSourceFile(code, 'service.ts');
    const result = generateTests(analysis);

    expect(result.suiteCount).toBe(1);
    expect(result.testCode).toContain("describe('Service'");
    expect(result.testCode).toContain('new Service');
    expect(result.testCode).toContain('beforeEach');
    expect(result.testCode).toContain("describe('getItem'");
    expect(result.testCode).toContain("describe('count'");
    expect(result.testCode).toContain('await instance.getItem');
  });

  it('should generate test code for an interface', () => {
    const code = `
export interface Config {
  host: string;
  port: number;
  debug?: boolean;
}`;
    const analysis = analyzeSourceFile(code, 'config.ts');
    const result = generateTests(analysis);

    expect(result.suiteCount).toBe(1);
    expect(result.testCode).toContain("describe('Config interface'");
    expect(result.testCode).toContain('const obj: Config');
    expect(result.testCode).toContain("host: 'test-value'");
    expect(result.testCode).toContain('port: 42');
    // debug is optional, should not be required
    expect(result.testCode).not.toContain('debug:');
  });

  it('should produce zero suites for an empty file', () => {
    const analysis = analyzeSourceFile('// just a comment', 'empty.ts');
    const result = generateTests(analysis);

    expect(result.suiteCount).toBe(0);
  });

  it('should handle a file with multiple constructs', () => {
    const code = `
export function add(a: number, b: number): number { return a + b; }
export class Calculator { compute(): number { return 0; } }
export interface Result { value: number; }
`;
    const analysis = analyzeSourceFile(code, 'multi.ts');
    const result = generateTests(analysis);

    expect(result.suiteCount).toBe(3);
    expect(result.testCode).toContain("describe('add'");
    expect(result.testCode).toContain("describe('Calculator'");
    expect(result.testCode).toContain("describe('Result interface'");
  });

  it('should use star import style when configured', () => {
    const code = `export function greet(): string { return ''; }`;
    const analysis = analyzeSourceFile(code, 'greet.ts');
    const result = generateTests(analysis, { importStyle: 'star' });

    expect(result.testCode).toContain("import * as greet from './greet'");
  });

  it('should exclude private methods from class tests', () => {
    const code = `
export class MyClass {
  public doWork(): void {}
  private internal(): void {}
}`;
    const analysis = analyzeSourceFile(code, 'my.ts');
    const result = generateTests(analysis);

    expect(result.testCode).toContain("describe('doWork'");
    expect(result.testCode).not.toContain("describe('internal'");
  });

  it('should handle static methods with class prefix', () => {
    const code = `
export class MathUtils {
  static clamp(value: number): number { return value; }
}`;
    const analysis = analyzeSourceFile(code, 'math-utils.ts');
    const result = generateTests(analysis);

    expect(result.testCode).toContain('MathUtils.clamp');
  });
});
