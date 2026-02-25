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

const DEFAULT_CONFIG: GeneratorConfig = {
  testStyle: 'bdd',
  includeTypeChecks: false,
  includeSnapshots: false,
  importStyle: 'named',
  includeSetupTeardown: true,
  indent: 2,
  singleQuote: true,
};

export function getConfig(overrides: Partial<GeneratorConfig> = {}): GeneratorConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

export function quoteChar(config: GeneratorConfig): string {
  return config.singleQuote ? "'" : '"';
}

export function indent(level: number, config: GeneratorConfig): string {
  return ' '.repeat(level * config.indent);
}
