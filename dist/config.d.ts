/**
 * Configuration manager for ts-jest-test-generator.
 */
export interface GeneratorConfig {
    /** Style of test descriptions: 'bdd' uses describe/it, 'flat' uses test() */
    testStyle: 'bdd' | 'flat';
    /** Whether to include type-checking assertions */
    includeTypeChecks: boolean;
    /** Whether to generate snapshot tests for complex return types */
    includeSnapshots: boolean;
    /** Import style for the module under test */
    importStyle: 'named' | 'default' | 'star';
    /** Whether to add setup/teardown hooks when class methods are detected */
    includeSetupTeardown: boolean;
    /** Indentation: number of spaces */
    indent: number;
    /** Whether to use single quotes in generated code */
    singleQuote: boolean;
}
export declare function getConfig(overrides?: Partial<GeneratorConfig>): GeneratorConfig;
export declare function quoteChar(config: GeneratorConfig): string;
export declare function indent(level: number, config: GeneratorConfig): string;
//# sourceMappingURL=config.d.ts.map