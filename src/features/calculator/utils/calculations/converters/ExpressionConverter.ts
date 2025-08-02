import * as math from 'mathjs';
import type { MathNode, FunctionNode, SymbolNode } from 'mathjs';
import { CalculatorConstants } from '@calculator/utils/constants/CalculatorConstants';

/**
 * Helper to create a new OperatorNode for multiplication.
 * @param operand1 The first operand.
 * @param operand2 The second operand.
 * @returns A new OperatorNode for multiplication.
 */
const createMultiplyNode = (operand1: MathNode, operand2: MathNode) =>
  new math.OperatorNode('*', 'multiply', [operand1, operand2]);

/**
 * Helper to create a new FunctionNode.
 * @param fn The name of the function.
 * @param args The arguments for the function.
 * @returns A new FunctionNode.
 */
const createFunctionNode = (fn: string, args: MathNode[]) =>
  new math.FunctionNode(new math.SymbolNode(fn), args);

/**
 * Helper to create a new reciprocal expression (1 / arg).
 * @param arg The argument for the reciprocal.
 * @returns A new OperatorNode for the reciprocal.
 */
const createReciprocal = (arg: MathNode) =>
  new math.OperatorNode('/', 'divide', [new math.ConstantNode(1), arg]);

/**
 * Converts a scientific expression string into a format compatible with mathjs,
 * handling various functions and angle modes using an Abstract Syntax Tree (AST).
 */
export class ExpressionConverter {
  /**
   * Converts a scientific expression by first transforming the AST to handle
   * angle conversions and function rewrites.
   * @param expr The mathematical expression string.
   * @param angleMode The current angle mode ('RAD', 'DEG', or 'GRAD').
   * @returns The converted expression as a string.
   */
  convert(expr: string, angleMode: 'RAD' | 'DEG' | 'GRAD'): string {
    // Stage 1: Pre-process the string for non-standard syntax
    const preprocessedExpr = this._preprocess(expr);

    // Stage 2: Parse the expression into a mathjs Abstract Syntax Tree (AST)
    const node = math.parse(preprocessedExpr);

    // Stage 3: Transform the AST to handle angle conversions and function rewrites
    const transformedNode = this._transform(node, angleMode);
    
    // Stage 4: Convert the transformed AST back to a string and return it
    // The responsibility for evaluating or simplifying this expression
    // rests with the caller (e.g., the ScientificCalculations class).
    return transformedNode.toString();
  }

  /**
   * Handles string-based pre-processing of the expression.
   * This method converts non-standard calculator syntax and aliases
   * to a format that mathjs can parse correctly.
   * @param expr The raw mathematical expression string.
   * @returns The pre-processed expression string.
   */
  private _preprocess(expr: string): string {
    // A map for pre-processing non-standard syntax to mathjs-compatible forms.
    // The order is important to ensure 'ln' is processed before 'log'.
    const preprocessingMap: { [key: string]: string } = {
        'ln': 'log',
        'log': 'log10',
        '×': '*',
        '÷': '/',
        '√': 'sqrt',
        '∛': 'cbrt',
    };

    let preprocessedExpr = expr;
    // Apply pre-processing replacements
    for (const [key, value] of Object.entries(preprocessingMap)) {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      preprocessedExpr = preprocessedExpr.replace(regex, value);
    }
    
    // Replace user-facing function aliases with mathjs equivalents from constants
    for (const [display, internal] of Object.entries(CalculatorConstants.FUNCTION_MAPPINGS)) {
      const regex = new RegExp(display.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
      preprocessedExpr = preprocessedExpr.replace(regex, internal);
    }

    return preprocessedExpr;
  }

  /**
   * Transforms the Abstract Syntax Tree (AST) to handle function rewrites and angle conversions.
   * @param node The AST node to transform.
   * @param angleMode The current angle mode ('RAD', 'DEG', or 'GRAD').
   * @returns The transformed AST node.
   */
  private _transform(node: MathNode, angleMode: 'RAD' | 'DEG' | 'GRAD'): MathNode {
    return node.transform(
      (node: MathNode) => {
        // Defensive guard against invalid nodes
        if (!math.isNode(node)) {
          return node;
        }

        if (node.type === 'FunctionNode') {
          const fnNode = node as FunctionNode;
          const fnName = (fnNode.fn as SymbolNode).name;
          const args = fnNode.args;

          // Defensive check for functions with missing arguments
          if (!args || args.length === 0) {
            return node;
          }

          // Rewriting specific functions to a mathjs-compatible AST
          switch (fnName) {
            case 'csch': {
              const denominator = createFunctionNode('sinh', args);
              return createReciprocal(denominator);
            }
            case 'sech': {
              const denominator = createFunctionNode('cosh', args);
              return createReciprocal(denominator);
            }
            case 'coth': {
              const denominator = createFunctionNode('tanh', args);
              return createReciprocal(denominator);
            }
            case 'acsch': {
              const newArg = createReciprocal(args[0]);
              return createFunctionNode('asinh', [newArg]);
            }
            case 'asech': {
              const newArg = createReciprocal(args[0]);
              return createFunctionNode('acosh', [newArg]);
            }
            case 'acoth': {
              const newArg = createReciprocal(args[0]);
              return createFunctionNode('atanh', [newArg]);
            }
            case 'reciprocal': {
              return createReciprocal(args[0]);
            }
            case 'sqr': return createFunctionNode('pow', [args[0], new math.ConstantNode(2)]);
            case 'cube': return createFunctionNode('pow', [args[0], new math.ConstantNode(3)]);
            default:
              break;
          }

          // Angle conversion logic for trigonometric functions
          const trigFunctions = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
          const inverseTrigFunctions = ['asin', 'acos', 'atan', 'acsc', 'asec', 'acot'];
          
          if (trigFunctions.includes(fnName)) {
            const newArgs = args.map((arg: MathNode) => {
              if (angleMode === 'DEG') {
                const conversionFactor = new math.OperatorNode('/', 'divide', [new math.ConstantNode(Math.PI), new math.ConstantNode(180)]);
                return createMultiplyNode(arg, conversionFactor);
              } else if (angleMode === 'GRAD') {
                const conversionFactor = new math.OperatorNode('/', 'divide', [new math.ConstantNode(Math.PI), new math.ConstantNode(200)]);
                return createMultiplyNode(arg, conversionFactor);
              }
              return arg;
            });
            return createFunctionNode(fnName, newArgs);
          } else if (inverseTrigFunctions.includes(fnName)) {
            if (angleMode === 'DEG') {
              const conversionFactor = new math.OperatorNode('/', 'divide', [new math.ConstantNode(180), new math.ConstantNode(Math.PI)]);
              return createMultiplyNode(node, conversionFactor);
            } else if (angleMode === 'GRAD') {
              const conversionFactor = new math.OperatorNode('/', 'divide', [new math.ConstantNode(200), new math.ConstantNode(Math.PI)]);
              return createMultiplyNode(node, conversionFactor);
            }
          }
        }
        return node;
      }
    );
  }
}
