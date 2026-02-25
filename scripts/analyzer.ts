import * as ts from 'typescript';
import {
  collectNodes,
  extractParams,
  getReturnType,
  isExported,
  isAsync,
  getNodeName,
  getTypeText,
  ParamInfo,
} from './utils';
import {
  FunctionTestContext,
  ClassTestContext,
  MethodTestContext,
  InterfaceTestContext,
} from './patterns';

/**
 * Result of analyzing a TypeScript source file.
 */
export interface AnalysisResult {
  filePath: string;
  functions: FunctionTestContext[];
  classes: ClassTestContext[];
  interfaces: InterfaceTestContext[];
}

/**
 * Parse TypeScript source code into an AST SourceFile.
 */
export function parseSource(code: string, fileName: string = 'input.ts'): ts.SourceFile {
  return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/**
 * Analyze a TypeScript source file and extract testable constructs.
 */
export function analyzeSourceFile(code: string, filePath: string = 'input.ts'): AnalysisResult {
  const sourceFile = parseSource(code, filePath);
  const modulePath = filePath.replace(/\.tsx?$/, '');

  const functions = extractFunctions(sourceFile, modulePath);
  const classes = extractClasses(sourceFile, modulePath);
  const interfaces = extractInterfaces(sourceFile, modulePath);

  return { filePath, functions, classes, interfaces };
}

function extractFunctions(sourceFile: ts.SourceFile, modulePath: string): FunctionTestContext[] {
  const results: FunctionTestContext[] = [];

  // Top-level function declarations
  const funcDecls = collectNodes(sourceFile, ts.SyntaxKind.FunctionDeclaration) as ts.FunctionDeclaration[];
  for (const decl of funcDecls) {
    // Only include top-level functions (direct children of source file)
    if (decl.parent !== sourceFile) continue;
    const name = getNodeName(decl);
    if (!name) continue;

    results.push({
      name,
      params: extractParams(decl),
      returnType: getReturnType(decl),
      isAsync: isAsync(decl),
      isExported: isExported(decl),
      modulePath,
    });
  }

  // Top-level arrow functions / function expressions assigned to variables
  const varStatements = collectNodes(sourceFile, ts.SyntaxKind.VariableStatement) as ts.VariableStatement[];
  for (const stmt of varStatements) {
    if (stmt.parent !== sourceFile) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!decl.initializer) continue;
      if (
        ts.isArrowFunction(decl.initializer) ||
        ts.isFunctionExpression(decl.initializer)
      ) {
        const name = getNodeName(decl);
        if (!name) continue;
        const fn = decl.initializer as ts.FunctionLikeDeclaration;
        results.push({
          name,
          params: extractParams(fn),
          returnType: getReturnType(fn),
          isAsync: isAsync(fn),
          isExported: isExported(stmt),
          modulePath,
        });
      }
    }
  }

  return results;
}

function getVisibility(member: ts.ClassElement): 'public' | 'protected' | 'private' {
  const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
  if (!modifiers) return 'public';
  for (const m of modifiers) {
    if (m.kind === ts.SyntaxKind.PrivateKeyword) return 'private';
    if (m.kind === ts.SyntaxKind.ProtectedKeyword) return 'protected';
  }
  return 'public';
}

function isStaticMember(member: ts.ClassElement): boolean {
  const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
  if (!modifiers) return false;
  return modifiers.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
}

function extractClasses(sourceFile: ts.SourceFile, modulePath: string): ClassTestContext[] {
  const results: ClassTestContext[] = [];
  const classDecls = collectNodes(sourceFile, ts.SyntaxKind.ClassDeclaration) as ts.ClassDeclaration[];

  for (const decl of classDecls) {
    if (decl.parent !== sourceFile) continue;
    const className = getNodeName(decl);
    if (!className) continue;

    let constructorParams: ParamInfo[] = [];
    const methods: MethodTestContext[] = [];

    for (const member of decl.members) {
      if (ts.isConstructorDeclaration(member)) {
        constructorParams = extractParams(member);
      } else if (ts.isMethodDeclaration(member)) {
        const methodName = getNodeName(member as unknown as ts.Declaration);
        if (!methodName) continue;
        methods.push({
          name: methodName,
          params: extractParams(member),
          returnType: getReturnType(member),
          isAsync: isAsync(member),
          isStatic: isStaticMember(member),
          visibility: getVisibility(member),
        });
      }
    }

    results.push({
      className,
      constructorParams,
      methods,
      isExported: isExported(decl),
      modulePath,
    });
  }

  return results;
}

function extractInterfaces(sourceFile: ts.SourceFile, modulePath: string): InterfaceTestContext[] {
  const results: InterfaceTestContext[] = [];
  const ifaceDecls = collectNodes(
    sourceFile,
    ts.SyntaxKind.InterfaceDeclaration,
  ) as ts.InterfaceDeclaration[];

  for (const decl of ifaceDecls) {
    if (decl.parent !== sourceFile) continue;
    const name = getNodeName(decl);
    if (!name) continue;

    const properties: { name: string; type: string; optional: boolean }[] = [];
    for (const member of decl.members) {
      if (ts.isPropertySignature(member)) {
        const propName = member.name ? (member.name as ts.Identifier).text : undefined;
        if (!propName) continue;
        properties.push({
          name: propName,
          type: getTypeText(member.type),
          optional: !!member.questionToken,
        });
      }
    }

    results.push({ name, properties, modulePath });
  }

  return results;
}
