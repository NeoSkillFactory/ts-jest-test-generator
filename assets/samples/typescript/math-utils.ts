export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export const multiply = (a: number, b: number): number => a * b;

export async function divideAsync(a: number, b: number): Promise<number> {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

export class Calculator {
  private history: number[] = [];

  constructor(private precision: number) {}

  add(a: number, b: number): number {
    const result = parseFloat((a + b).toFixed(this.precision));
    this.history.push(result);
    return result;
  }

  async fetchRate(currency: string): Promise<number> {
    return 1.0;
  }

  static fromPrecision(precision: number): Calculator {
    return new Calculator(precision);
  }

  getHistory(): number[] {
    return [...this.history];
  }
}

export interface MathConfig {
  precision: number;
  roundingMode: string;
  debug?: boolean;
}
