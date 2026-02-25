#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { analyzeSourceFile } from './analyzer';
import { generateTests } from './generator';
import { GeneratorConfig } from './config';

interface CliOptions {
  files: string[];
  outputDir?: string;
  write: boolean;
  style: 'bdd' | 'flat';
  importStyle: 'named' | 'default' | 'star';
  quiet: boolean;
}

function printUsage(): void {
  console.log(`
ts-jest-test-generator - Generate Jest test templates from TypeScript code

Usage:
  ts-jest-gen [options] <file...>

Options:
  --output, -o <dir>    Write test files to the specified directory
  --write, -w           Write test files next to source files
  --style <bdd|flat>    Test style (default: bdd)
  --import <named|default|star>  Import style (default: named)
  --quiet, -q           Suppress informational output
  --help, -h            Show this help message

Examples:
  ts-jest-gen src/utils.ts
  ts-jest-gen --write src/**/*.ts
  ts-jest-gen -o tests/ src/service.ts
  echo '<ts code>' | ts-jest-gen --stdin
`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    files: [],
    write: false,
    style: 'bdd',
    importStyle: 'named',
    quiet: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
        break;
      case '--output':
      case '-o':
        i++;
        options.outputDir = argv[i];
        break;
      case '--write':
      case '-w':
        options.write = true;
        break;
      case '--style':
        i++;
        if (argv[i] === 'bdd' || argv[i] === 'flat') {
          options.style = argv[i] as 'bdd' | 'flat';
        } else {
          console.error(`Error: Invalid style "${argv[i]}". Use "bdd" or "flat".`);
          process.exit(1);
        }
        break;
      case '--import':
        i++;
        if (argv[i] === 'named' || argv[i] === 'default' || argv[i] === 'star') {
          options.importStyle = argv[i] as 'named' | 'default' | 'star';
        } else {
          console.error(`Error: Invalid import style "${argv[i]}".`);
          process.exit(1);
        }
        break;
      case '--quiet':
      case '-q':
        options.quiet = true;
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Error: Unknown option "${arg}". Use --help for usage.`);
          process.exit(1);
        }
        options.files.push(arg);
        break;
    }
    i++;
  }

  return options;
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function processFile(
  filePath: string,
  configOverrides: Partial<GeneratorConfig>,
  options: CliOptions,
): Promise<boolean> {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`);
    return false;
  }

  const code = fs.readFileSync(absolutePath, 'utf8');
  const analysis = analyzeSourceFile(code, absolutePath);
  const result = generateTests(analysis, configOverrides);

  if (result.suiteCount === 0) {
    if (!options.quiet) {
      console.log(`No testable constructs found in ${filePath}`);
    }
    return true;
  }

  if (options.write || options.outputDir) {
    let outPath: string;
    if (options.outputDir) {
      const testFileName = path.basename(result.testFileName);
      outPath = path.join(options.outputDir, testFileName);
    } else {
      outPath = result.testFileName;
    }

    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outPath, result.testCode, 'utf8');
    if (!options.quiet) {
      console.log(`Generated ${result.suiteCount} test suite(s) -> ${outPath}`);
    }
  } else {
    // Print to stdout
    console.log(result.testCode);
  }

  return true;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Check if stdin has data (piped input)
    if (!process.stdin.isTTY) {
      const code = await readStdin();
      if (!code.trim()) {
        console.error('Error: No input received from stdin.');
        process.exit(1);
      }
      const analysis = analyzeSourceFile(code, 'stdin.ts');
      const result = generateTests(analysis);
      if (result.suiteCount === 0) {
        console.log('No testable constructs found in input.');
      } else {
        console.log(result.testCode);
      }
      return;
    }

    printUsage();
    process.exit(1);
  }

  const options = parseArgs(args);

  if (options.files.length === 0) {
    console.error('Error: No input files specified. Use --help for usage.');
    process.exit(1);
  }

  const configOverrides: Partial<GeneratorConfig> = {
    testStyle: options.style,
    importStyle: options.importStyle,
  };

  let allOk = true;
  for (const file of options.files) {
    const ok = await processFile(file, configOverrides, options);
    if (!ok) allOk = false;
  }

  if (!allOk) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
