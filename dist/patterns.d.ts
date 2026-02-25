import { GeneratorConfig } from './config';
import { ParamInfo } from './utils';
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
    properties: {
        name: string;
        type: string;
        optional: boolean;
    }[];
    modulePath: string;
}
/** Generate a test block for a standalone function. */
export declare function functionTestPattern(ctx: FunctionTestContext, config: GeneratorConfig): string;
/** Generate a test block for a class. */
export declare function classTestPattern(ctx: ClassTestContext, config: GeneratorConfig): string;
/** Generate a type-guard / shape test for an interface. */
export declare function interfaceTestPattern(ctx: InterfaceTestContext, config: GeneratorConfig): string;
//# sourceMappingURL=patterns.d.ts.map