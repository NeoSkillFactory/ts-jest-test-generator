import { GeneratorConfig } from './config';
import { AnalysisResult } from './analyzer';
/**
 * Result of test generation.
 */
export interface GenerationResult {
    /** Suggested file name for the test file */
    testFileName: string;
    /** Full generated test source code */
    testCode: string;
    /** Number of test suites generated */
    suiteCount: number;
}
/**
 * Generate a Jest test file from an analysis result.
 */
export declare function generateTests(analysis: AnalysisResult, configOverrides?: Partial<GeneratorConfig>): GenerationResult;
//# sourceMappingURL=generator.d.ts.map