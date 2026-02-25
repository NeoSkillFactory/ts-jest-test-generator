import * as ts from 'typescript';
import { collectNodes, mockValueForType, isExported, isAsync, getNodeName } from './utils';

function parse(code: string): ts.SourceFile {
  return ts.createSourceFile('test.ts', code, ts.ScriptTarget.Latest, true);
}

describe('utils', () => {
  describe('collectNodes', () => {
    it('should collect function declarations', () => {
      const sf = parse('function a() {} function b() {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.FunctionDeclaration);
      expect(nodes).toHaveLength(2);
    });

    it('should return empty for no matches', () => {
      const sf = parse('const x = 1;');
      const nodes = collectNodes(sf, ts.SyntaxKind.ClassDeclaration);
      expect(nodes).toHaveLength(0);
    });
  });

  describe('mockValueForType', () => {
    it('should return correct mocks for primitive types', () => {
      expect(mockValueForType('string')).toBe("'test-value'");
      expect(mockValueForType('number')).toBe('42');
      expect(mockValueForType('boolean')).toBe('true');
      expect(mockValueForType('void')).toBe('undefined');
      expect(mockValueForType('null')).toBe('null');
    });

    it('should handle array types', () => {
      expect(mockValueForType('string[]')).toBe('[]');
      expect(mockValueForType('Array<number>')).toBe('[]');
    });

    it('should handle promise types', () => {
      expect(mockValueForType('Promise<void>')).toBe('Promise.resolve()');
      expect(mockValueForType('Promise<string>')).toBe('Promise.resolve({} as any)');
    });

    it('should handle unknown types with a cast', () => {
      expect(mockValueForType('SomeCustomType')).toBe('{} as any');
    });
  });

  describe('isExported', () => {
    it('should detect export keyword', () => {
      const sf = parse('export function foo() {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.FunctionDeclaration);
      expect(isExported(nodes[0])).toBe(true);
    });

    it('should return false when no export', () => {
      const sf = parse('function foo() {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.FunctionDeclaration);
      expect(isExported(nodes[0])).toBe(false);
    });
  });

  describe('isAsync', () => {
    it('should detect async keyword', () => {
      const sf = parse('async function foo() {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.FunctionDeclaration);
      expect(isAsync(nodes[0])).toBe(true);
    });

    it('should return false when not async', () => {
      const sf = parse('function foo() {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.FunctionDeclaration);
      expect(isAsync(nodes[0])).toBe(false);
    });
  });

  describe('getNodeName', () => {
    it('should return function name', () => {
      const sf = parse('function hello() {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.FunctionDeclaration);
      expect(getNodeName(nodes[0] as ts.Declaration)).toBe('hello');
    });

    it('should return class name', () => {
      const sf = parse('class MyClass {}');
      const nodes = collectNodes(sf, ts.SyntaxKind.ClassDeclaration);
      expect(getNodeName(nodes[0] as ts.Declaration)).toBe('MyClass');
    });
  });
});
