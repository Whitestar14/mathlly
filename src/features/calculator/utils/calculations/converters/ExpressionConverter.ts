import * as math from 'mathjs'
import type { MathNode, FunctionNode, SymbolNode } from 'mathjs'

const TRIG_FUNCS = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot']
const INV_TRIG_FUNCS = ['asin', 'acos', 'atan', 'acsc', 'asec', 'acot']
const REWRITE_FUNCS = new Set([
  'sqr',
  'cube',
  'reciprocal',
  'csch',
  'sech',
  'coth',
  'acsch',
  'asech',
  'acoth'
])

/**
 * MOCK for the user's CalculatorConstants. This is for the code to be self-contained.
 * The actual file should be used in the user's project.
 */
const CalculatorConstants = {

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
    deg: 'deg'
  }
}

/**
 * Helper to create a new OperatorNode for multiplication.
 * @param operand1 The first operand.
 * @param operand2 The second operand.
 * @returns A new OperatorNode for multiplication.
 */
const createMultiplyNode = (operand1: MathNode, operand2: MathNode) =>
  new math.OperatorNode('*', 'multiply', [operand1, operand2])

/**
 * Helper to create a new FunctionNode.
 * @param fn The name of the function.
 * @param args The arguments for the function.
 * @returns A new FunctionNode.
 */
const createFunctionNode = (fn: string, args: MathNode[]) =>
  new math.FunctionNode(new math.SymbolNode(fn), args)

/**
 * Helper to create a new reciprocal expression (1 / arg).
 * @param arg The argument for the reciprocal.
 * @returns A new OperatorNode for the reciprocal.
 */
const createReciprocal = (arg: MathNode) =>
  new math.OperatorNode('/', 'divide', [new math.ConstantNode(1), arg])

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
    const preprocessedExpr = this._preprocess(expr)

    const node = math.parse(preprocessedExpr)

    const transformedNode = this._transform(node, angleMode)

    return transformedNode.toString()
  }

  /**
   * Handles string-based pre-processing of the expression.
   * This method converts non-standard calculator syntax and aliases
   * to a format that mathjs can parse correctly.
   * @param expr The raw mathematical expression string.
   * @returns The pre-processed expression string.
   */
  private _preprocess(expr: string): string {
    const preprocessingMap: { [key: string]: string } = {
      ...CalculatorConstants.FUNCTION_MAPPINGS
    }

    let preprocessedExpr = expr

    for (const [key, value] of Object.entries(preprocessingMap)) {
      const regex = new RegExp(
        `\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'g'
      )
      preprocessedExpr = preprocessedExpr.replace(regex, value)
    }

    preprocessedExpr = preprocessedExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/√/g, 'sqrt').replace(/∛/g, 'cbrt')

    return preprocessedExpr
  }

  /**
   * Helper to create an AST node for DMS conversion.
   * Converts a decimal degree value into a pseudo-DMS format (DDD.MMSS).
   * @param arg The AST node representing the decimal degree value.
   * @returns A new OperatorNode representing the DMS conversion.
   */
  private _createDmsNode(arg: MathNode) {
    const degrees = createFunctionNode('floor', [arg])

    const fractionalPart = new math.OperatorNode('-', 'subtract', [
      arg,
      degrees
    ])

    const minutes = createFunctionNode('floor', [
      createMultiplyNode(fractionalPart, new math.ConstantNode(60))
    ])

    const seconds = createMultiplyNode(
      new math.OperatorNode('-', 'subtract', [
        createMultiplyNode(fractionalPart, new math.ConstantNode(60)),
        minutes
      ]),
      new math.ConstantNode(60)
    )

    const minutesPart = new math.OperatorNode('/', 'divide', [
      minutes,
      new math.ConstantNode(100)
    ])
    const secondsPart = new math.OperatorNode('/', 'divide', [
      seconds,
      new math.ConstantNode(10000)
    ])
    const remainder = new math.OperatorNode('+', 'add', [
      minutesPart,
      secondsPart
    ])

    return new math.OperatorNode('+', 'add', [degrees, remainder])
  }

  /**
   * Helper to create an AST node for DEG conversion.
   * Converts a pseudo-DMS format (DDD.MMSS) into a decimal degree value.
   * @param arg The AST node representing the pseudo-DMS value.
   * @returns A new OperatorNode representing the DEG conversion.
   */
  private _createDegNode(arg: MathNode) {
    const degrees = createFunctionNode('floor', [arg])

    const fractionalPart = new math.OperatorNode('-', 'subtract', [
      arg,
      degrees
    ])

    const minutes = createFunctionNode('floor', [
      createMultiplyNode(fractionalPart, new math.ConstantNode(100))
    ])

    const seconds = createMultiplyNode(
      new math.OperatorNode('-', 'subtract', [
        createMultiplyNode(fractionalPart, new math.ConstantNode(100)),
        minutes
      ]),
      new math.ConstantNode(100)
    )

    const minutesPart = new math.OperatorNode('/', 'divide', [
      minutes,
      new math.ConstantNode(60)
    ])
    const secondsPart = new math.OperatorNode('/', 'divide', [
      seconds,
      new math.ConstantNode(3600)
    ])
    const remainder = new math.OperatorNode('+', 'add', [
      minutesPart,
      secondsPart
    ])

    return new math.OperatorNode('+', 'add', [degrees, remainder])
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
      if (!math.isNode(node)) {
        return node
      }

      if (node.type === 'FunctionNode') {
        const fnNode = node as FunctionNode
        const fnName = (fnNode.fn as SymbolNode).name
        const args = fnNode.args

        if (!args || args.length === 0) {
          return node
        }

        if (REWRITE_FUNCS.has(fnName)) {
          switch (fnName) {
            case 'csch':
              return createReciprocal(createFunctionNode('sinh', args))
            case 'sech':
              return createReciprocal(createFunctionNode('cosh', args))
            case 'coth':
              return createReciprocal(createFunctionNode('tanh', args))
            case 'acsch':
              return createFunctionNode('asinh', [createReciprocal(args[0])])
            case 'asech':
              return createFunctionNode('acosh', [createReciprocal(args[0])])
            case 'acoth':
              return createFunctionNode('atanh', [createReciprocal(args[0])])
            case 'reciprocal':
              return createReciprocal(args[0])
            case 'sqr':
              return createFunctionNode('pow', [
                args[0],
                new math.ConstantNode(2)
              ])
            case 'cube':
              return createFunctionNode('pow', [
                args[0],
                new math.ConstantNode(3)
              ])
            default:
              break
          }
        }

        if (fnName === 'dms') {
          const transformedArg = this._transform(args[0], angleMode)
          return this._createDmsNode(transformedArg)
        }
        if (fnName === 'deg') {
          const transformedArg = this._transform(args[0], angleMode)
          return this._createDegNode(transformedArg)
        }

        if (TRIG_FUNCS.includes(fnName)) {
          const newArgs = args.map((arg: MathNode) => {
            if (angleMode === 'DEG') {
              const conversionFactor = new math.OperatorNode('/', 'divide', [
                new math.ConstantNode(Math.PI),
                new math.ConstantNode(180)
              ])
              return createMultiplyNode(arg, conversionFactor)
            } else if (angleMode === 'GRAD') {
              const conversionFactor = new math.OperatorNode('/', 'divide', [
                new math.ConstantNode(Math.PI),
                new math.ConstantNode(200)
              ])
              return createMultiplyNode(arg, conversionFactor)
            }
            return arg
          })
          return createFunctionNode(fnName, newArgs)
        }

        if (INV_TRIG_FUNCS.includes(fnName)) {
          if (angleMode === 'DEG') {
            const conversionFactor = new math.OperatorNode('/', 'divide', [
              new math.ConstantNode(180),
              new math.ConstantNode(Math.PI)
            ])
            return createMultiplyNode(node, conversionFactor)
          } else if (angleMode === 'GRAD') {
            const conversionFactor = new math.OperatorNode('/', 'divide', [
              new math.ConstantNode(200),
              new math.ConstantNode(Math.PI)
            ])
            return createMultiplyNode(node, conversionFactor)
          }
        }
      }
      return node
    })
  }
}
