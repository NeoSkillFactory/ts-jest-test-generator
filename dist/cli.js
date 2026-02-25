#!/usr/bin/env node
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const analyzer_1 = require("./analyzer");
const generator_1 = require("./generator");
function printUsage() {
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
function parseArgs(argv) {
    const options = {
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
                    options.style = argv[i];
                }
                else {
                    console.error(`Error: Invalid style "${argv[i]}". Use "bdd" or "flat".`);
                    process.exit(1);
                }
                break;
            case '--import':
                i++;
                if (argv[i] === 'named' || argv[i] === 'default' || argv[i] === 'star') {
                    options.importStyle = argv[i];
                }
                else {
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
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => (data += chunk));
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
    });
}
async function processFile(filePath, configOverrides, options) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: File not found: ${absolutePath}`);
        return false;
    }
    const code = fs.readFileSync(absolutePath, 'utf8');
    const analysis = (0, analyzer_1.analyzeSourceFile)(code, absolutePath);
    const result = (0, generator_1.generateTests)(analysis, configOverrides);
    if (result.suiteCount === 0) {
        if (!options.quiet) {
            console.log(`No testable constructs found in ${filePath}`);
        }
        return true;
    }
    if (options.write || options.outputDir) {
        let outPath;
        if (options.outputDir) {
            const testFileName = path.basename(result.testFileName);
            outPath = path.join(options.outputDir, testFileName);
        }
        else {
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
    }
    else {
        // Print to stdout
        console.log(result.testCode);
    }
    return true;
}
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        // Check if stdin has data (piped input)
        if (!process.stdin.isTTY) {
            const code = await readStdin();
            if (!code.trim()) {
                console.error('Error: No input received from stdin.');
                process.exit(1);
            }
            const analysis = (0, analyzer_1.analyzeSourceFile)(code, 'stdin.ts');
            const result = (0, generator_1.generateTests)(analysis);
            if (result.suiteCount === 0) {
                console.log('No testable constructs found in input.');
            }
            else {
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
    const configOverrides = {
        testStyle: options.style,
        importStyle: options.importStyle,
    };
    let allOk = true;
    for (const file of options.files) {
        const ok = await processFile(file, configOverrides, options);
        if (!ok)
            allOk = false;
    }
    if (!allOk) {
        process.exit(1);
    }
}
main().catch((err) => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map