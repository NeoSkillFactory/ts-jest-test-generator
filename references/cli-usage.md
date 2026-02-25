# CLI Usage Specification

## Command Syntax

```
ts-jest-gen [options] <file...>
```

## Arguments

- `<file...>`: One or more TypeScript file paths to analyze

## Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--output` | `-o` | string | - | Output directory for generated test files |
| `--write` | `-w` | boolean | false | Write tests next to source files |
| `--style` | - | `bdd\|flat` | `bdd` | Test description style |
| `--import` | - | `named\|default\|star` | `named` | Import style for source module |
| `--quiet` | `-q` | boolean | false | Suppress info messages |
| `--help` | `-h` | boolean | false | Print help and exit |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (file not found, parse error, invalid args) |

## Stdin Support

When no files are given and stdin is piped, the tool reads TypeScript code from stdin.

```bash
echo 'export function greet(name: string): string { return name; }' | ts-jest-gen
```
