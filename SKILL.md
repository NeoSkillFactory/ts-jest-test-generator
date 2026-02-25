---
name: ts-jest-test-generator
description: Automatically generates Jest unit test templates from TypeScript code analysis
version: 1.0.0
triggers:
  - generate jest tests for typescript
  - create unit test templates
  - write jest tests for typescript classes
  - generate test scaffolding for typescript
  - create test boilerplate
---

# ts-jest-test-generator

## Overview

This skill analyzes TypeScript source code and automatically generates corresponding Jest unit test templates. It parses TypeScript AST to identify testable constructs (functions, classes, interfaces) and produces ready-to-use test files with proper imports, describe blocks, and assertions.

## Core Components

| Script | Purpose |
|--------|---------|
| `scripts/analyzer.ts` | Parses TypeScript code into AST and extracts testable constructs |
| `scripts/generator.ts` | Transforms analysis results into Jest test source code |
| `scripts/patterns.ts` | Test pattern templates for functions, classes, and interfaces |
| `scripts/config.ts` | Configuration management (test style, imports, formatting) |
| `scripts/utils.ts` | AST traversal helpers and type utilities |
| `scripts/cli.ts` | Command-line interface for direct usage |
| `scripts/index.ts` | Main entry point re-exporting public API |

## CLI Usage

```bash
# Generate tests for a single file (prints to stdout)
node dist/cli.js src/myModule.ts

# Write test files next to source files
node dist/cli.js --write src/myModule.ts

# Write to a specific output directory
node dist/cli.js --output tests/ src/myModule.ts

# Pipe TypeScript code from stdin
cat src/myModule.ts | node dist/cli.js

# Use BDD or flat style
node dist/cli.js --style bdd src/myModule.ts
node dist/cli.js --style flat src/myModule.ts

# Control import style
node dist/cli.js --import named src/myModule.ts
node dist/cli.js --import star src/myModule.ts
```

## Architecture

```
TypeScript Source -> analyzer.ts (AST parsing)
                     -> patterns.ts (template matching)
                       -> generator.ts (test code output)
                         -> cli.ts (file I/O, stdout)
```

## Data Flow

1. User provides TypeScript file path or piped code
2. `analyzer.ts` parses code into AST and extracts functions, classes, interfaces
3. `patterns.ts` maps each construct to appropriate test templates
4. `generator.ts` assembles the complete test file with imports and assertions
5. `cli.ts` handles output (stdout or file write)

## Integration Guide

### Programmatic API

```typescript
import { analyzeSourceFile, generateTests } from './index';

const code = `export function add(a: number, b: number): number { return a + b; }`;
const analysis = analyzeSourceFile(code, 'math.ts');
const result = generateTests(analysis);

console.log(result.testCode);
// Output: Jest test with describe/it blocks for the add function
```

### Agent Workflow

An agent can trigger this skill by sending TypeScript code with a prompt like "Generate Jest tests for this code". The skill processes the input and returns generated test templates.

## Edge Cases

- Files with no exported functions/classes produce an empty test message
- Arrow functions assigned to `const` are detected alongside regular function declarations
- Private and protected class methods are excluded from test generation
- Optional parameters and default values are handled in mock generation
- Interfaces generate type-shape validation tests

## Output Specifications

The CLI exits with code 0 on success and code 1 on any error. Test code is output to stdout by default, or written to files with `--write` or `--output` flags.

## Requirements

- Node.js >= 16
- TypeScript >= 5.0
