"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionTestPattern = functionTestPattern;
exports.classTestPattern = classTestPattern;
exports.interfaceTestPattern = interfaceTestPattern;
const config_1 = require("./config");
const utils_1 = require("./utils");
/** Generate a test block for a standalone function. */
function functionTestPattern(ctx, config) {
    const q = (0, config_1.quoteChar)(config);
    const i1 = (0, config_1.indent)(1, config);
    const i2 = (0, config_1.indent)(2, config);
    const lines = [];
    lines.push(`describe(${q}${ctx.name}${q}, () => {`);
    // Basic call test
    const args = ctx.params
        .filter((p) => !p.optional && !p.hasDefault)
        .map((p) => (0, utils_1.mockValueForType)(p.type))
        .join(', ');
    if (ctx.isAsync) {
        lines.push(`${i1}it(${q}should resolve without errors${q}, async () => {`);
        lines.push(`${i2}const result = await ${ctx.name}(${args});`);
        lines.push(`${i2}expect(result).toBeDefined();`);
        lines.push(`${i1}});`);
    }
    else {
        lines.push(`${i1}it(${q}should return a result${q}, () => {`);
        lines.push(`${i2}const result = ${ctx.name}(${args});`);
        if (ctx.returnType === 'void') {
            lines.push(`${i2}expect(result).toBeUndefined();`);
        }
        else {
            lines.push(`${i2}expect(result).toBeDefined();`);
        }
        lines.push(`${i1}});`);
    }
    // Edge case: no arguments
    if (ctx.params.length > 0) {
        lines.push('');
        const edgeArgs = ctx.params
            .filter((p) => !p.optional && !p.hasDefault)
            .map((p) => {
            const t = p.type.toLowerCase();
            if (t === 'string')
                return "''";
            if (t === 'number')
                return '0';
            if (t === 'boolean')
                return 'false';
            return (0, utils_1.mockValueForType)(p.type);
        })
            .join(', ');
        if (ctx.isAsync) {
            lines.push(`${i1}it(${q}should handle edge cases${q}, async () => {`);
            lines.push(`${i2}const result = await ${ctx.name}(${edgeArgs});`);
        }
        else {
            lines.push(`${i1}it(${q}should handle edge cases${q}, () => {`);
            lines.push(`${i2}const result = ${ctx.name}(${edgeArgs});`);
        }
        lines.push(`${i2}expect(result).toBeDefined();`);
        lines.push(`${i1}});`);
    }
    lines.push(`});`);
    return lines.join('\n');
}
/** Generate a test block for a class. */
function classTestPattern(ctx, config) {
    const q = (0, config_1.quoteChar)(config);
    const i1 = (0, config_1.indent)(1, config);
    const i2 = (0, config_1.indent)(2, config);
    const i3 = (0, config_1.indent)(3, config);
    const lines = [];
    const ctorArgs = ctx.constructorParams
        .filter((p) => !p.optional && !p.hasDefault)
        .map((p) => (0, utils_1.mockValueForType)(p.type))
        .join(', ');
    lines.push(`describe(${q}${ctx.className}${q}, () => {`);
    if (config.includeSetupTeardown && ctx.methods.length > 0) {
        lines.push(`${i1}let instance: ${ctx.className};`);
        lines.push('');
        lines.push(`${i1}beforeEach(() => {`);
        lines.push(`${i2}instance = new ${ctx.className}(${ctorArgs});`);
        lines.push(`${i1}});`);
        lines.push('');
    }
    // Constructor test
    lines.push(`${i1}it(${q}should create an instance${q}, () => {`);
    if (config.includeSetupTeardown && ctx.methods.length > 0) {
        lines.push(`${i2}expect(instance).toBeInstanceOf(${ctx.className});`);
    }
    else {
        lines.push(`${i2}const obj = new ${ctx.className}(${ctorArgs});`);
        lines.push(`${i2}expect(obj).toBeInstanceOf(${ctx.className});`);
    }
    lines.push(`${i1}});`);
    // Method tests
    const testable = ctx.methods.filter((m) => m.visibility === 'public');
    for (const method of testable) {
        lines.push('');
        const methodArgs = method.params
            .filter((p) => !p.optional && !p.hasDefault)
            .map((p) => (0, utils_1.mockValueForType)(p.type))
            .join(', ');
        lines.push(`${i1}describe(${q}${method.name}${q}, () => {`);
        if (method.isAsync) {
            lines.push(`${i2}it(${q}should resolve without errors${q}, async () => {`);
            if (method.isStatic) {
                lines.push(`${i3}const result = await ${ctx.className}.${method.name}(${methodArgs});`);
            }
            else {
                lines.push(`${i3}const result = await instance.${method.name}(${methodArgs});`);
            }
            lines.push(`${i3}expect(result).toBeDefined();`);
            lines.push(`${i2}});`);
        }
        else {
            lines.push(`${i2}it(${q}should execute correctly${q}, () => {`);
            if (method.isStatic) {
                lines.push(`${i3}const result = ${ctx.className}.${method.name}(${methodArgs});`);
            }
            else {
                lines.push(`${i3}const result = instance.${method.name}(${methodArgs});`);
            }
            if (method.returnType === 'void') {
                lines.push(`${i3}expect(result).toBeUndefined();`);
            }
            else {
                lines.push(`${i3}expect(result).toBeDefined();`);
            }
            lines.push(`${i2}});`);
        }
        lines.push(`${i1}});`);
    }
    lines.push(`});`);
    return lines.join('\n');
}
/** Generate a type-guard / shape test for an interface. */
function interfaceTestPattern(ctx, config) {
    const q = (0, config_1.quoteChar)(config);
    const i1 = (0, config_1.indent)(1, config);
    const i2 = (0, config_1.indent)(2, config);
    const lines = [];
    lines.push(`describe(${q}${ctx.name} interface${q}, () => {`);
    lines.push(`${i1}it(${q}should accept a valid object${q}, () => {`);
    lines.push(`${i2}const obj: ${ctx.name} = {`);
    for (const prop of ctx.properties) {
        if (!prop.optional) {
            lines.push(`${i2}  ${prop.name}: ${(0, utils_1.mockValueForType)(prop.type)},`);
        }
    }
    lines.push(`${i2}};`);
    lines.push(`${i2}expect(obj).toBeDefined();`);
    for (const prop of ctx.properties) {
        if (!prop.optional) {
            lines.push(`${i2}expect(obj.${prop.name}).toBeDefined();`);
        }
    }
    lines.push(`${i1}});`);
    lines.push(`});`);
    return lines.join('\n');
}
//# sourceMappingURL=patterns.js.map