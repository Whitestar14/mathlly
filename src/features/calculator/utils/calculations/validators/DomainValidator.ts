import * as math from 'mathjs';
import type { MathNode, FunctionNode, SymbolNode } from 'mathjs';
import { ERROR_MESSAGES } from '@calculator/utils/constants/CalculatorConstants';

/**
 * Interface for a function's domain validation rule.
 * @param args The arguments of the function as a MathNode array.
 * @returns An error message string if the domain is violated, otherwise null.
 */
type DomainRule = (args: MathNode[]) => string | null;

/**
 * A reusable helper to safely evaluate a MathNode to a number.
 * It returns a number if successful, otherwise `undefined`.
 * The correct way to evaluate a MathNode is to compile it first.
 * @param node The MathNode to evaluate.
 * @returns The evaluated number or `undefined`.
 */
function safeEval(node: MathNode): number | undefined {
  try {
    const compiled = node.compile();
    const result = compiled.evaluate();
    return typeof result === 'number' ? result : undefined;
  } catch {
    return undefined;
  }
}

/**
 * A reusable helper to build a consistent error message string.
 * @param fn The name of the function.
 * @param arg The argument value that caused the error.
 * @param msg The specific message about the domain violation.
 * @returns A formatted error message string.
 */
function errorMessage(fn: string, arg: number, msg: string): string {
  return `${ERROR_MESSAGES.DOMAIN_ERROR}: ${fn}(${arg}) - ${msg}`;
}

/**
 * A reusable helper to create domain rules for range checks.
 * This function DRYs up the code for functions like `acosh`, `asin`, etc.
 * @param name The name of the function.
 * @param predicate A function that returns true if the value is in the domain.
 * @param message The error message to display for a domain violation.
 * @returns A DomainRule function.
 */
function checkRangeDomain(name: string, predicate: (n: number) => boolean, message: string): DomainRule {
  return ([arg]) => {
    const argValue = safeEval(arg);
    if (argValue !== undefined && !predicate(argValue)) {
      return errorMessage(name, argValue, message);
    }
    return null;
  };
}

/**
 * A centralized map of domain validation rules for specific functions.
 * This makes the validation logic declarative and easy to maintain.
 */
const domainRules: Record<string, DomainRule> = {
  /**
   * Domain rule for `acosh(x)`: x must be >= 1.
   */
  acosh: checkRangeDomain('acosh', x => x >= 1, 'argument must be ≥ 1'),
  
  /**
   * Domain rule for `acoth(x)`: |x| must be > 1.
   */
  acoth: checkRangeDomain('acoth', x => Math.abs(x) > 1, 'argument must satisfy |x| > 1'),

  /**
   * Domain rule for `atanh(x)`: |x| must be < 1.
   */
  atanh: checkRangeDomain('atanh', x => Math.abs(x) < 1, 'argument must satisfy |x| < 1'),
  
  /**
   * Domain rule for `asin(x)` and `acos(x)`: |x| must be <= 1.
   */
  asin: checkRangeDomain('asin', x => Math.abs(x) <= 1, 'argument must satisfy |x| ≤ 1'),
  acos: checkRangeDomain('acos', x => Math.abs(x) <= 1, 'argument must satisfy |x| ≤ 1'),

  /**
   * Domain rule for `sqrt(x)`: x must be >= 0.
   */
  sqrt: checkRangeDomain('sqrt', x => x >= 0, 'argument must be ≥ 0'),

  /**
   * Domain rule for `log(x)` and `log10(x)`: x must be > 0.
   * Note: The `ExpressionConverter` converts `ln` and `log` to `log` (natural) and `log10` (base 10).
   */
  log: checkRangeDomain('log', x => x > 0, 'argument must be > 0'),
  log10: checkRangeDomain('log10', x => x > 0, 'argument must be > 0'),
};

/**
 * A Set of all function names that have a defined domain rule.
 * This provides a fast way to check if a function needs validation.
 */
const knownFunctions = new Set(Object.keys(domainRules));

/**
 * A generic validator pipeline that walks a parsed mathjs AST to check for domain violations.
 * This approach is more robust and scalable than string-based regex matching.
 */
export class DomainValidator {
  /**
   * Walks the AST and checks for domain violations for known functions.
   * @param expr The root node of the parsed mathjs AST, or a string expression.
   * @returns An array of error messages for any domain violations found.
   */
  validate(expr: string | MathNode): string[] {
    const errors: string[] = [];
    let node: MathNode;

    try {
      node = typeof expr === 'string' ? math.parse(expr) : expr;
    } catch (parseError: any) {
      // If parsing fails, we can't validate the domain.
      return [parseError.message];
    }
    
    // Find all function nodes in the AST.
    const functionNodes = node.filter(n => n.type === 'FunctionNode') as FunctionNode[];

    for (const fnNode of functionNodes) {
      // Normalize function name to handle case variations.
      const fnName = (fnNode.fn as SymbolNode).name.toLowerCase();

      // Check if a domain rule exists for this function using the fast lookup Set.
      if (knownFunctions.has(fnName)) {
        // Run the rule and collect any error message.
        const rule = domainRules[fnName];
        const error = rule(fnNode.args);
        if (error) {
          errors.push(error);
        }
      }
    }
    
    return errors;
  }
}
