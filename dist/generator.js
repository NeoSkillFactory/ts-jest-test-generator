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
exports.generateTests = generateTests;
const path = __importStar(require("path"));
const config_1 = require("./config");
const patterns_1 = require("./patterns");
/**
 * Generate a Jest test file from an analysis result.
 */
function generateTests(analysis, configOverrides = {}) {
    const config = (0, config_1.getConfig)(configOverrides);
    const q = (0, config_1.quoteChar)(config);
    const lines = [];
    let suiteCount = 0;
    // Build import line
    const importNames = collectImportNames(analysis);
    const relativeModule = computeRelativeImport(analysis.filePath);
    if (importNames.length > 0) {
        if (config.importStyle === 'star') {
            const modAlias = path.basename(analysis.filePath).replace(/\.tsx?$/, '');
            lines.push(`import * as ${modAlias} from ${q}${relativeModule}${q};`);
        }
        else if (config.importStyle === 'default' && importNames.length === 1) {
            lines.push(`import ${importNames[0]} from ${q}${relativeModule}${q};`);
        }
        else {
            lines.push(`import { ${importNames.join(', ')} } from ${q}${relativeModule}${q};`);
        }
        lines.push('');
    }
    // Generate function tests
    for (const fn of analysis.functions) {
        lines.push((0, patterns_1.functionTestPattern)(fn, config));
        lines.push('');
        suiteCount++;
    }
    // Generate class tests
    for (const cls of analysis.classes) {
        lines.push((0, patterns_1.classTestPattern)(cls, config));
        lines.push('');
        suiteCount++;
    }
    // Generate interface tests
    for (const iface of analysis.interfaces) {
        lines.push((0, patterns_1.interfaceTestPattern)(iface, config));
        lines.push('');
        suiteCount++;
    }
    const testFileName = computeTestFileName(analysis.filePath);
    const testCode = lines.join('\n').trimEnd() + '\n';
    return { testFileName, testCode, suiteCount };
}
function collectImportNames(analysis) {
    const names = [];
    for (const fn of analysis.functions) {
        if (fn.isExported)
            names.push(fn.name);
    }
    for (const cls of analysis.classes) {
        if (cls.isExported)
            names.push(cls.className);
    }
    for (const iface of analysis.interfaces) {
        names.push(iface.name);
    }
    return names;
}
function computeRelativeImport(filePath) {
    const base = path.basename(filePath).replace(/\.tsx?$/, '');
    return `./${base}`;
}
function computeTestFileName(filePath) {
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    return path.join(dir, `${base}.test${ext || '.ts'}`);
}
//# sourceMappingURL=generator.js.map