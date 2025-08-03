import * as math from 'mathjs';
import type { MathNode, FunctionNode, SymbolNode } from 'mathjs';

// Define constants for function names to improve maintainability and prevent typos.
const TRIG_FUNCS = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];
const INV_TRIG_FUNCS = ['asin', 'acos', 'atan', 'acsc', 'asec', 'acot'];
const REWRITE_FUNCS = new Set([
  'sqr',
  'cube',
  'reciprocal',
  'csch',
  'sech',
  'coth',
  'acsch',
  'asech',
  'acoth',
]);

/**
 * MOCK for the user's CalculatorConstants. This is for the code to be self-contained.
 * The actual file should be used in the user's project.
 */
const CalculatorConstants = {
  // Merged the pre-processing maps into a single object for clarity.
  FUNCTION_MAPPINGS: {
    ln: 'log',
    log: 'log10',
    '×': '*',
    '÷': '/',
    '√': 'sqrt',
    '∛': 'cbrt',
    sqr: 'sqr',
    cube: 'cube',
    reciprocal: 'reciprocal',
    dms: 'dms',
    deg: 'deg',
  },
};

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
    // A single, unified map for pre-processing non-standard syntax to mathjs-compatible forms.
    // This consolidates `preprocessingMap` and `ALIAS_MAPPINGS`.
    const preprocessingMap: { [key: string]: string } = {
      ...CalculatorConstants.FUNCTION_MAPPINGS,
    };

    let preprocessedExpr = expr;
    // Apply pre-processing replacements
    for (const [key, value] of Object.entries(preprocessingMap)) {
      // Use word boundaries for a more robust match on function names.
      const regex = new RegExp(
        `\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'g'
      );
      preprocessedExpr = preprocessedExpr.replace(regex, value);
    }

    // Handle standalone symbols like '×' and '÷'
    preprocessedExpr = preprocessedExpr.replace(/×/g, '*').replace(/÷/g, '/');

    return preprocessedExpr;
  }

  /**
   * Helper to create an AST node for DMS conversion.
   * Converts a decimal degree value into a pseudo-DMS format (DDD.MMSS).
   * @param arg The AST node representing the decimal degree value.
   * @returns A new OperatorNode representing the DMS conversion.
   */
  private _createDmsNode(arg: MathNode) {
    // floor(arg)
    const degrees = createFunctionNode('floor', [arg]);

    // (arg - floor(arg))
    const fractionalPart = new math.OperatorNode('-', 'subtract', [
      arg,
      degrees,
    ]);

    // floor((arg - floor(arg)) * 60)
    const minutes = createFunctionNode('floor', [
      createMultiplyNode(fractionalPart, new math.ConstantNode(60)),
    ]);

    // (((arg - floor(arg)) * 60) - floor((arg - floor(arg)) * 60)) * 60
    const seconds = createMultiplyNode(
      new math.OperatorNode('-', 'subtract', [
        createMultiplyNode(fractionalPart, new math.ConstantNode(60)),
        minutes,
      ]),
      new math.ConstantNode(60)
    );

    // (minutes / 100) + (seconds / 10000)
    const minutesPart = new math.OperatorNode('/', 'divide', [
      minutes,
      new math.ConstantNode(100),
    ]);
    const secondsPart = new math.OperatorNode('/', 'divide', [
      seconds,
      new math.ConstantNode(10000),
    ]);
    const remainder = new math.OperatorNode('+', 'add', [
      minutesPart,
      secondsPart,
    ]);

    // floor(arg) + (minutes / 100) + (seconds / 10000)
    return new math.OperatorNode('+', 'add', [degrees, remainder]);
  }

  /**
   * Helper to create an AST node for DEG conversion.
   * Converts a pseudo-DMS format (DDD.MMSS) into a decimal degree value.
   * @param arg The AST node representing the pseudo-DMS value.
   * @returns A new OperatorNode representing the DEG conversion.
   */
  private _createDegNode(arg: MathNode) {
    // floor(arg)
    const degrees = createFunctionNode('floor', [arg]);

    // (arg - floor(arg))
    const fractionalPart = new math.OperatorNode('-', 'subtract', [
      arg,
      degrees,
    ]);

    // floor(fractionalPart * 100)
    const minutes = createFunctionNode('floor', [
      createMultiplyNode(fractionalPart, new math.ConstantNode(100)),
    ]);

    // (fractionalPart * 100 - minutes) * 100
    const seconds = createMultiplyNode(
      new math.OperatorNode('-', 'subtract', [
        createMultiplyNode(fractionalPart, new math.ConstantNode(100)),
        minutes,
      ]),
      new math.ConstantNode(100)
    );

    // (minutes / 60) + (seconds / 3600)
    const minutesPart = new math.OperatorNode('/', 'divide', [
      minutes,
      new math.ConstantNode(60),
    ]);
    const secondsPart = new math.OperatorNode('/', 'divide', [
      seconds,
      new math.ConstantNode(3600),
    ]);
    const remainder = new math.OperatorNode('+', 'add', [
      minutesPart,
      secondsPart,
    ]);

    // degrees + (minutes / 60) + (seconds / 3600)
    return new math.OperatorNode('+', 'add', [degrees, remainder]);
  }

  /**
   * Transforms the Abstract Syntax Tree (AST) to handle function rewrites and angle conversions.
   * @param node The AST node to transform.
   * @param angleMode The current angle mode ('RAD', 'DEG', or 'GRAD').
   * @returns The transformed AST node.
   */
  private _transform(
    node: MathNode,
    angleMode: 'RAD' | 'DEG' | 'GRAD'
  ): MathNode {
    return node.transform((node: MathNode) => {
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

        // Use a Set for fast lookup of functions that require a rewrite
        if (REWRITE_FUNCS.has(fnName)) {
          switch (fnName) {
            case 'csch':
              return createReciprocal(createFunctionNode('sinh', args));
            case 'sech':
              return createReciprocal(createFunctionNode('cosh', args));
            case 'coth':
              return createReciprocal(createFunctionNode('tanh', args));
            case 'acsch':
              return createFunctionNode('asinh', [createReciprocal(args[0])]);
            case 'asech':
              return createFunctionNode('acosh', [createReciprocal(args[0])]);
            case 'acoth':
              return createFunctionNode('atanh', [createReciprocal(args[0])]);
            case 'reciprocal':
              return createReciprocal(args[0]);
            case 'sqr':
              return createFunctionNode('pow', [
                args[0],
                new math.ConstantNode(2),
              ]);
            case 'cube':
              return createFunctionNode('pow', [
                args[0],
                new math.ConstantNode(3),
              ]);
            default:
              break;
          }
        }

        // Handle dms and deg functions
        // CRITICAL FIX: Recursively transform the arguments to handle nested calls.
        if (fnName === 'dms') {
          const transformedArg = this._transform(args[0], angleMode);
          return this._createDmsNode(transformedArg);
        }
        if (fnName === 'deg') {
          const transformedArg = this._transform(args[0], angleMode);
          return this._createDegNode(transformedArg);
        }

        // Angle conversion logic for trigonometric functions
        if (TRIG_FUNCS.includes(fnName)) {
          const newArgs = args.map((arg: MathNode) => {
            if (angleMode === 'DEG') {
              const conversionFactor = new math.OperatorNode('/', 'divide', [
                new math.ConstantNode(Math.PI),
                new math.ConstantNode(180),
              ]);
              return createMultiplyNode(arg, conversionFactor);
            } else if (angleMode === 'GRAD') {
              const conversionFactor = new math.OperatorNode('/', 'divide', [
                new math.ConstantNode(Math.PI),
                new math.ConstantNode(200),
              ]);
              return createMultiplyNode(arg, conversionFactor);
            }
            return arg;
          });
          return createFunctionNode(fnName, newArgs);
        }

        if (INV_TRIG_FUNCS.includes(fnName)) {
          if (angleMode === 'DEG') {
            // The inverse trig function node itself is wrapped in a multiplier, which is semantically
            // equivalent to applying a conversion to the result of the function.
            const conversionFactor = new math.OperatorNode('/', 'divide', [
              new math.ConstantNode(180),
              new math.ConstantNode(Math.PI),
            ]);
            return createMultiplyNode(node, conversionFactor);
          } else if (angleMode === 'GRAD') {
            const conversionFactor = new math.OperatorNode('/', 'divide', [
              new math.ConstantNode(200),
              new math.ConstantNode(Math.PI),
            ]);
            return createMultiplyNode(node, conversionFactor);
          }
        }
      }
      return node;
    });
  }
}
