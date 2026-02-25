import { GeneratorConfig, indent as ind, quoteChar } from './config';
import { ParamInfo, mockValueForType } from './utils';

/**
 * Test pattern templates for different TypeScript constructs.
 */

export interface FunctionTestContext {
  name: string;
  params: ParamInfo[];
  returnType: string;
  isAsync: boolean;
  isExported: boolean;
  modulePath: string;
}

export interface ClassTestContext {
  className: string;
  constructorParams: ParamInfo[];
  methods: MethodTestContext[];
  isExported: boolean;
  modulePath: string;
}

export interface MethodTestContext {
  name: string;
  params: ParamInfo[];
  returnType: string;
  isAsync: boolean;
  isStatic: boolean;
  visibility: 'public' | 'protected' | 'private';
}

export interface InterfaceTestContext {
  name: string;
  properties: { name: string; type: string; optional: boolean }[];
  modulePath: string;
}

/** Generate a test block for a standalone function. */
export function functionTestPattern(ctx: FunctionTestContext, config: GeneratorConfig): string {
  const q = quoteChar(config);
  const i1 = ind(1, config);
  const i2 = ind(2, config);
  const lines: string[] = [];

  lines.push(`describe(${q}${ctx.name}${q}, () => {`);

  // Basic call test
  const args = ctx.params
    .filter((p) => !p.optional && !p.hasDefault)
    .map((p) => mockValueForType(p.type))
    .join(', ');

  if (ctx.isAsync) {
    lines.push(`${i1}it(${q}should resolve without errors${q}, async () => {`);
    lines.push(`${i2}const result = await ${ctx.name}(${args});`);
    lines.push(`${i2}expect(result).toBeDefined();`);
    lines.push(`${i1}});`);
  } else {
    lines.push(`${i1}it(${q}should return a result${q}, () => {`);
    lines.push(`${i2}const result = ${ctx.name}(${args});`);
    if (ctx.returnType === 'void') {
      lines.push(`${i2}expect(result).toBeUndefined();`);
    } else {
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
        if (t === 'string') return "''";
        if (t === 'number') return '0';
        if (t === 'boolean') return 'false';
        return mockValueForType(p.type);
      })
      .join(', ');
    if (ctx.isAsync) {
      lines.push(`${i1}it(${q}should handle edge cases${q}, async () => {`);
      lines.push(`${i2}const result = await ${ctx.name}(${edgeArgs});`);
    } else {
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
export function classTestPattern(ctx: ClassTestContext, config: GeneratorConfig): string {
  const q = quoteChar(config);
  const i1 = ind(1, config);
  const i2 = ind(2, config);
  const i3 = ind(3, config);
  const lines: string[] = [];

  const ctorArgs = ctx.constructorParams
    .filter((p) => !p.optional && !p.hasDefault)
    .map((p) => mockValueForType(p.type))
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
  } else {
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
      .map((p) => mockValueForType(p.type))
      .join(', ');

    lines.push(`${i1}describe(${q}${method.name}${q}, () => {`);

    if (method.isAsync) {
      lines.push(`${i2}it(${q}should resolve without errors${q}, async () => {`);
      if (method.isStatic) {
        lines.push(`${i3}const result = await ${ctx.className}.${method.name}(${methodArgs});`);
      } else {
        lines.push(`${i3}const result = await instance.${method.name}(${methodArgs});`);
      }
      lines.push(`${i3}expect(result).toBeDefined();`);
      lines.push(`${i2}});`);
    } else {
      lines.push(`${i2}it(${q}should execute correctly${q}, () => {`);
      if (method.isStatic) {
        lines.push(`${i3}const result = ${ctx.className}.${method.name}(${methodArgs});`);
      } else {
        lines.push(`${i3}const result = instance.${method.name}(${methodArgs});`);
      }
      if (method.returnType === 'void') {
        lines.push(`${i3}expect(result).toBeUndefined();`);
      } else {
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
export function interfaceTestPattern(ctx: InterfaceTestContext, config: GeneratorConfig): string {
  const q = quoteChar(config);
  const i1 = ind(1, config);
  const i2 = ind(2, config);
  const lines: string[] = [];

  lines.push(`describe(${q}${ctx.name} interface${q}, () => {`);
  lines.push(`${i1}it(${q}should accept a valid object${q}, () => {`);

  lines.push(`${i2}const obj: ${ctx.name} = {`);
  for (const prop of ctx.properties) {
    if (!prop.optional) {
      lines.push(`${i2}  ${prop.name}: ${mockValueForType(prop.type)},`);
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
