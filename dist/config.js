"use strict";
/**
 * Configuration manager for ts-jest-test-generator.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.quoteChar = quoteChar;
exports.indent = indent;
const DEFAULT_CONFIG = {
    testStyle: 'bdd',
    includeTypeChecks: false,
    includeSnapshots: false,
    importStyle: 'named',
    includeSetupTeardown: true,
    indent: 2,
    singleQuote: true,
};
function getConfig(overrides = {}) {
    return { ...DEFAULT_CONFIG, ...overrides };
}
function quoteChar(config) {
    return config.singleQuote ? "'" : '"';
}
function indent(level, config) {
    return ' '.repeat(level * config.indent);
}
//# sourceMappingURL=config.js.map