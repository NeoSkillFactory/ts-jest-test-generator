import * as ts from 'typescript';
/**
 * Utility functions for AST traversal and type extraction.
 */
/** Recursively collect all nodes of a given kind from an AST. */
export declare function collectNodes(root: ts.Node, kind: ts.SyntaxKind): ts.Node[];
/** Collect all nodes matching a predicate. */
export declare function collectNodesWhere(root: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node[];
/** Get the text of a type node, or 'any' if missing. */
export declare function getTypeText(typeNode: ts.TypeNode | undefined): string;
/** Extract parameter info from a function-like declaration. */
export interface ParamInfo {
    name: string;
    type: string;
    optional: boolean;
    hasDefault: boolean;
}
export declare function extractParams(node: ts.FunctionLikeDeclaration): ParamInfo[];
/** Extract the return type text from a function-like declaration. */
export declare function getReturnType(node: ts.FunctionLikeDeclaration): string;
/** Check if a node has the 'export' modifier. */
export declare function isExported(node: ts.Node): boolean;
/** Check if a node has the 'async' modifier. */
export declare function isAsync(node: ts.Node): boolean;
/** Get the name of a declaration node (function, class, etc.). */
export declare function getNodeName(node: ts.Declaration): string | undefined;
/** Generate a default mock value for a given type string. */
export declare function mockValueForType(typeStr: string): string;
//# sourceMappingURL=utils.d.ts.map