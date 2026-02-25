"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectNodes = collectNodes;
exports.collectNodesWhere = collectNodesWhere;
exports.getTypeText = getTypeText;
exports.extractParams = extractParams;
exports.getReturnType = getReturnType;
exports.isExported = isExported;
exports.isAsync = isAsync;
exports.getNodeName = getNodeName;
exports.mockValueForType = mockValueForType;
const ts = __importStar(require("typescript"));
/**
 * Utility functions for AST traversal and type extraction.
 */
/** Recursively collect all nodes of a given kind from an AST. */
function collectNodes(root, kind) {
    const results = [];
    function visit(node) {
        if (node.kind === kind) {
            results.push(node);
        }
        ts.forEachChild(node, visit);
    }
    visit(root);
    return results;
}
/** Collect all nodes matching a predicate. */
function collectNodesWhere(root, predicate) {
    const results = [];
    function visit(node) {
        if (predicate(node)) {
            results.push(node);
        }
        ts.forEachChild(node, visit);
    }
    visit(root);
    return results;
}
/** Get the text of a type node, or 'any' if missing. */
function getTypeText(typeNode) {
    if (!typeNode)
        return 'any';
    // Use the printer to get clean type text
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest);
    return printer.printNode(ts.EmitHint.Unspecified, typeNode, sourceFile);
}
function extractParams(node) {
    return node.parameters.map((param) => ({
        name: param.name.getText ? param.name.getText() : param.name.text || 'unknown',
        type: getTypeText(param.type),
        optional: !!param.questionToken,
        hasDefault: !!param.initializer,
    }));
}
/** Extract the return type text from a function-like declaration. */
function getReturnType(node) {
    return getTypeText(node.type);
}
/** Check if a node has the 'export' modifier. */
function isExported(node) {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    if (!modifiers)
        return false;
    return modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}
/** Check if a node has the 'async' modifier. */
function isAsync(node) {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    if (!modifiers)
        return false;
    return modifiers.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
}
/** Get the name of a declaration node (function, class, etc.). */
function getNodeName(node) {
    const nameNode = node.name;
    if (!nameNode)
        return undefined;
    if (ts.isIdentifier(nameNode))
        return nameNode.text;
    if (ts.isStringLiteral(nameNode))
        return nameNode.text;
    return undefined;
}
/** Generate a default mock value for a given type string. */
function mockValueForType(typeStr) {
    const t = typeStr.trim().toLowerCase();
    if (t === 'string')
        return "'test-value'";
    if (t === 'number')
        return '42';
    if (t === 'boolean')
        return 'true';
    if (t === 'void' || t === 'undefined')
        return 'undefined';
    if (t === 'null')
        return 'null';
    if (t === 'any')
        return "'mock-value'";
    if (t.endsWith('[]') || t.startsWith('array<'))
        return '[]';
    if (t === 'date')
        return 'new Date()';
    if (t === 'promise<void>')
        return 'Promise.resolve()';
    if (t.startsWith('promise<'))
        return 'Promise.resolve({} as any)';
    if (t.startsWith('record<') || t === 'object')
        return '{}';
    return '{} as any';
}
//# sourceMappingURL=utils.js.map