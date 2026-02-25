import * as path from 'path';
import { GeneratorConfig, getConfig, quoteChar } from './config';
import { AnalysisResult } from './analyzer';
import {
  functionTestPattern,
  classTestPattern,
  interfaceTestPattern,
} from './patterns';

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
export function generateTests(
  analysis: AnalysisResult,
  configOverrides: Partial<GeneratorConfig> = {},
): GenerationResult {
  const config = getConfig(configOverrides);
  const q = quoteChar(config);
  const lines: string[] = [];
  let suiteCount = 0;

  // Build import line
  const importNames = collectImportNames(analysis);
  const relativeModule = computeRelativeImport(analysis.filePath);

  if (importNames.length > 0) {
    if (config.importStyle === 'star') {
      const modAlias = path.basename(analysis.filePath).replace(/\.tsx?$/, '');
      lines.push(`import * as ${modAlias} from ${q}${relativeModule}${q};`);
    } else if (config.importStyle === 'default' && importNames.length === 1) {
      lines.push(`import ${importNames[0]} from ${q}${relativeModule}${q};`);
    } else {
      lines.push(`import { ${importNames.join(', ')} } from ${q}${relativeModule}${q};`);
    }
    lines.push('');
  }

  // Generate function tests
  for (const fn of analysis.functions) {
    lines.push(functionTestPattern(fn, config));
    lines.push('');
    suiteCount++;
  }

  // Generate class tests
  for (const cls of analysis.classes) {
    lines.push(classTestPattern(cls, config));
    lines.push('');
    suiteCount++;
  }

  // Generate interface tests
  for (const iface of analysis.interfaces) {
    lines.push(interfaceTestPattern(iface, config));
    lines.push('');
    suiteCount++;
  }

  const testFileName = computeTestFileName(analysis.filePath);
  const testCode = lines.join('\n').trimEnd() + '\n';

  return { testFileName, testCode, suiteCount };
}

function collectImportNames(analysis: AnalysisResult): string[] {
  const names: string[] = [];
  for (const fn of analysis.functions) {
    if (fn.isExported) names.push(fn.name);
  }
  for (const cls of analysis.classes) {
    if (cls.isExported) names.push(cls.className);
  }
  for (const iface of analysis.interfaces) {
    names.push(iface.name);
  }
  return names;
}

function computeRelativeImport(filePath: string): string {
  const base = path.basename(filePath).replace(/\.tsx?$/, '');
  return `./${base}`;
}

function computeTestFileName(filePath: string): string {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  return path.join(dir, `${base}.test${ext || '.ts'}`);
}
