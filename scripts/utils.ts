import * as ts from 'typescript';

/**
 * Utility functions for AST traversal and type extraction.
 */

/** Recursively collect all nodes of a given kind from an AST. */
export function collectNodes(root: ts.Node, kind: ts.SyntaxKind): ts.Node[] {
  const results: ts.Node[] = [];
  function visit(node: ts.Node): void {
    if (node.kind === kind) {
      results.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(root);
  return results;
}

/** Collect all nodes matching a predicate. */
export function collectNodesWhere(root: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node[] {
  const results: ts.Node[] = [];
  function visit(node: ts.Node): void {
    if (predicate(node)) {
      results.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(root);
  return results;
}

/** Get the text of a type node, or 'any' if missing. */
export function getTypeText(typeNode: ts.TypeNode | undefined): string {
  if (!typeNode) return 'any';
  // Use the printer to get clean type text
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const sourceFile = ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest);
  return printer.printNode(ts.EmitHint.Unspecified, typeNode, sourceFile);
}

/** Extract parameter info from a function-like declaration. */
export interface ParamInfo {
  name: string;
  type: string;
  optional: boolean;
  hasDefault: boolean;
}

export function extractParams(node: ts.FunctionLikeDeclaration): ParamInfo[] {
  return node.parameters.map((param) => ({
    name: param.name.getText ? param.name.getText() : (param.name as ts.Identifier).text || 'unknown',
    type: getTypeText(param.type),
    optional: !!param.questionToken,
    hasDefault: !!param.initializer,
  }));
}

/** Extract the return type text from a function-like declaration. */
export function getReturnType(node: ts.FunctionLikeDeclaration): string {
  return getTypeText(node.type);
}

/** Check if a node has the 'export' modifier. */
export function isExported(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  if (!modifiers) return false;
  return modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

/** Check if a node has the 'async' modifier. */
export function isAsync(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  if (!modifiers) return false;
  return modifiers.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
}

/** Get the name of a declaration node (function, class, etc.). */
export function getNodeName(node: ts.Declaration): string | undefined {
  const nameNode = (node as ts.NamedDeclaration).name;
  if (!nameNode) return undefined;
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  if (ts.isStringLiteral(nameNode)) return nameNode.text;
  return undefined;
}

/** Generate a default mock value for a given type string. */
export function mockValueForType(typeStr: string): string {
  const t = typeStr.trim().toLowerCase();
  if (t === 'string') return "'test-value'";
  if (t === 'number') return '42';
  if (t === 'boolean') return 'true';
  if (t === 'void' || t === 'undefined') return 'undefined';
  if (t === 'null') return 'null';
  if (t === 'any') return "'mock-value'";
  if (t.endsWith('[]') || t.startsWith('array<')) return '[]';
  if (t === 'date') return 'new Date()';
  if (t === 'promise<void>') return 'Promise.resolve()';
  if (t.startsWith('promise<')) return 'Promise.resolve({} as any)';
  if (t.startsWith('record<') || t === 'object') return '{}';
  return '{} as any';
}
