import { evaluate } from 'mathjs';
import { ERROR_MESSAGES } from '@calculator/utils/constants/CalculatorConstants';

export class DomainValidator {
  /**
   * Check for potential domain violations in the expression
   */
  validate(expr: string): void {
    this.checkAcothDomain(expr);
    this.checkAcoshDomain(expr);
    this.checkAtanhDomain(expr);
    this.checkInverseTrigDomain(expr);
    this.checkSqrtDomain(expr);
    this.checkLogDomain(expr);
  }

  private checkAcothDomain(expr: string): void {
    const matches = expr.match(/acoth\(([^)]+)\)/g);
    if (!matches) return;

    for (const match of matches) {
      const valueMatch = match.match(/acoth\(([^)]+)\)/);
      if (valueMatch) {
        try {
          const argValue = evaluate(valueMatch[1]);
          if (typeof argValue === 'number' && Math.abs(argValue) <= 1) {
            throw new Error(
              `${ERROR_MESSAGES.DOMAIN_ERROR}: acoth(${argValue}) - argument must satisfy |x| > 1`
            );
          }
        } catch {
          continue;
        }
      }
    }
  }

  private checkAcoshDomain(expr: string): void {
    const matches = expr.match(/acosh\(([^)]+)\)/g);
    if (!matches) return;

    for (const match of matches) {
      const valueMatch = match.match(/acosh\(([^)]+)\)/);
      if (valueMatch) {
        try {
          const argValue = evaluate(valueMatch[1]);
          if (typeof argValue === 'number' && argValue < 1) {
            throw new Error(
              `${ERROR_MESSAGES.DOMAIN_ERROR}: acosh(${argValue}) - argument must be ≥ 1`
            );
          }
        } catch {
          continue;
        }
      }
    }
  }

  private checkAtanhDomain(expr: string): void {
    const matches = expr.match(/atanh\(([^)]+)\)/g);
    if (!matches) return;

    for (const match of matches) {
      const valueMatch = match.match(/atanh\(([^)]+)\)/);
      if (valueMatch) {
        try {
          const argValue = evaluate(valueMatch[1]);
          if (typeof argValue === 'number' && Math.abs(argValue) >= 1) {
            throw new Error(
              `${ERROR_MESSAGES.DOMAIN_ERROR}: atanh(${argValue}) - argument must satisfy |x| < 1`
            );
          }
        } catch {
          continue;
        }
      }
    }
  }

  private checkInverseTrigDomain(expr: string): void {
    // Check asin domain
    const asinMatches = expr.match(/asin\(([^)]+)\)/g);
    if (asinMatches) {
      for (const match of asinMatches) {
        const valueMatch = match.match(/asin\(([^)]+)\)/);
        if (valueMatch) {
          try {
            const argValue = evaluate(valueMatch[1]);
            if (typeof argValue === 'number' && Math.abs(argValue) > 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: asin(${argValue}) - argument must satisfy |x| ≤ 1`
              );
            }
          } catch {
            continue;
          }
        }
      }
    }

    // Check acos domain
    const acosMatches = expr.match(/acos\(([^)]+)\)/g);
    if (acosMatches) {
      for (const match of acosMatches) {
        const valueMatch = match.match(/acos\(([^)]+)\)/);
        if (valueMatch) {
          try {
            const argValue = evaluate(valueMatch[1]);
            if (typeof argValue === 'number' && Math.abs(argValue) > 1) {
              throw new Error(
                `${ERROR_MESSAGES.DOMAIN_ERROR}: acos(${argValue}) - argument must satisfy |x| ≤ 1`
              );
            }
          } catch {
            continue;
          }
        }
      }
    }
  }

  private checkSqrtDomain(expr: string): void {
    const matches = expr.match(/√\(([^)]+)\)/g);
    if (!matches) return;

    for (const match of matches) {
      const valueMatch = match.match(/√\(([^)]+)\)/);
      if (valueMatch) {
        try {
          const argValue = evaluate(valueMatch[1]);
          if (typeof argValue === 'number' && argValue < 0) {
            throw new Error(
              `${ERROR_MESSAGES.DOMAIN_ERROR}: √(${argValue}) - argument must be ≥ 0`
            );
          }
        } catch {
          continue;
        }
      }
    }
  }

  private checkLogDomain(expr: string): void {
    const matches = expr.match(/(log|ln)\(([^)]+)\)/g);
    if (!matches) return;

    for (const match of matches) {
      const valueMatch = match.match(/(log|ln)\(([^)]+)\)/);
      if (valueMatch) {
        const funcName = valueMatch[1];
        const valueStr = valueMatch[2];
        try {
          const argValue = evaluate(valueStr);
          if (typeof argValue === 'number' && argValue <= 0) {
            throw new Error(
              `${ERROR_MESSAGES.DOMAIN_ERROR}: ${funcName}(${argValue}) - argument must be > 0`
            );
          }
        } catch {
          continue;
        }
      }
    }
  }
}
