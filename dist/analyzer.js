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
exports.parseSource = parseSource;
exports.analyzeSourceFile = analyzeSourceFile;
const ts = __importStar(require("typescript"));
const utils_1 = require("./utils");
/**
 * Parse TypeScript source code into an AST SourceFile.
 */
function parseSource(code, fileName = 'input.ts') {
    return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}
/**
 * Analyze a TypeScript source file and extract testable constructs.
 */
function analyzeSourceFile(code, filePath = 'input.ts') {
    const sourceFile = parseSource(code, filePath);
    const modulePath = filePath.replace(/\.tsx?$/, '');
    const functions = extractFunctions(sourceFile, modulePath);
    const classes = extractClasses(sourceFile, modulePath);
    const interfaces = extractInterfaces(sourceFile, modulePath);
    return { filePath, functions, classes, interfaces };
}
function extractFunctions(sourceFile, modulePath) {
    const results = [];
    // Top-level function declarations
    const funcDecls = (0, utils_1.collectNodes)(sourceFile, ts.SyntaxKind.FunctionDeclaration);
    for (const decl of funcDecls) {
        // Only include top-level functions (direct children of source file)
        if (decl.parent !== sourceFile)
            continue;
        const name = (0, utils_1.getNodeName)(decl);
        if (!name)
            continue;
        results.push({
            name,
            params: (0, utils_1.extractParams)(decl),
            returnType: (0, utils_1.getReturnType)(decl),
            isAsync: (0, utils_1.isAsync)(decl),
            isExported: (0, utils_1.isExported)(decl),
            modulePath,
        });
    }
    // Top-level arrow functions / function expressions assigned to variables
    const varStatements = (0, utils_1.collectNodes)(sourceFile, ts.SyntaxKind.VariableStatement);
    for (const stmt of varStatements) {
        if (stmt.parent !== sourceFile)
            continue;
        for (const decl of stmt.declarationList.declarations) {
            if (!decl.initializer)
                continue;
            if (ts.isArrowFunction(decl.initializer) ||
                ts.isFunctionExpression(decl.initializer)) {
                const name = (0, utils_1.getNodeName)(decl);
                if (!name)
                    continue;
                const fn = decl.initializer;
                results.push({
                    name,
                    params: (0, utils_1.extractParams)(fn),
                    returnType: (0, utils_1.getReturnType)(fn),
                    isAsync: (0, utils_1.isAsync)(fn),
                    isExported: (0, utils_1.isExported)(stmt),
                    modulePath,
                });
            }
        }
    }
    return results;
}
function getVisibility(member) {
    const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
    if (!modifiers)
        return 'public';
    for (const m of modifiers) {
        if (m.kind === ts.SyntaxKind.PrivateKeyword)
            return 'private';
        if (m.kind === ts.SyntaxKind.ProtectedKeyword)
            return 'protected';
    }
    return 'public';
}
function isStaticMember(member) {
    const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
    if (!modifiers)
        return false;
    return modifiers.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
}
function extractClasses(sourceFile, modulePath) {
    const results = [];
    const classDecls = (0, utils_1.collectNodes)(sourceFile, ts.SyntaxKind.ClassDeclaration);
    for (const decl of classDecls) {
        if (decl.parent !== sourceFile)
            continue;
        const className = (0, utils_1.getNodeName)(decl);
        if (!className)
            continue;
        let constructorParams = [];
        const methods = [];
        for (const member of decl.members) {
            if (ts.isConstructorDeclaration(member)) {
                constructorParams = (0, utils_1.extractParams)(member);
            }
            else if (ts.isMethodDeclaration(member)) {
                const methodName = (0, utils_1.getNodeName)(member);
                if (!methodName)
                    continue;
                methods.push({
                    name: methodName,
                    params: (0, utils_1.extractParams)(member),
                    returnType: (0, utils_1.getReturnType)(member),
                    isAsync: (0, utils_1.isAsync)(member),
                    isStatic: isStaticMember(member),
                    visibility: getVisibility(member),
                });
            }
        }
        results.push({
            className,
            constructorParams,
            methods,
            isExported: (0, utils_1.isExported)(decl),
            modulePath,
        });
    }
    return results;
}
function extractInterfaces(sourceFile, modulePath) {
    const results = [];
    const ifaceDecls = (0, utils_1.collectNodes)(sourceFile, ts.SyntaxKind.InterfaceDeclaration);
    for (const decl of ifaceDecls) {
        if (decl.parent !== sourceFile)
            continue;
        const name = (0, utils_1.getNodeName)(decl);
        if (!name)
            continue;
        const properties = [];
        for (const member of decl.members) {
            if (ts.isPropertySignature(member)) {
                const propName = member.name ? member.name.text : undefined;
                if (!propName)
                    continue;
                properties.push({
                    name: propName,
                    type: (0, utils_1.getTypeText)(member.type),
                    optional: !!member.questionToken,
                });
            }
        }
        results.push({ name, properties, modulePath });
    }
    return results;
}
//# sourceMappingURL=analyzer.js.map