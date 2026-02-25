import * as ts from 'typescript';
import { FunctionTestContext, ClassTestContext, InterfaceTestContext } from './patterns';
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
export declare function parseSource(code: string, fileName?: string): ts.SourceFile;
/**
 * Analyze a TypeScript source file and extract testable constructs.
 */
export declare function analyzeSourceFile(code: string, filePath?: string): AnalysisResult;
//# sourceMappingURL=analyzer.d.ts.map