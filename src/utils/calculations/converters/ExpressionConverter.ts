import { pi } from 'mathjs';

export class ExpressionConverter {
  private angleMode: 'RAD' | 'DEG' | 'GRAD';

  constructor(angleMode: 'RAD' | 'DEG' | 'GRAD' = 'DEG') {
    this.angleMode = angleMode;
  }

  setAngleMode(mode: 'RAD' | 'DEG' | 'GRAD'): void {
    this.angleMode = mode;
  }

  /**
   * Convert scientific expression to mathjs-compatible format
   */
  convert(expr: string): string {
    let result = expr.replace(/ln/g, 'log');
    
    // Step 1: Handle constants
    result = this.handleConstants(result);
    
    // Step 2: Handle nested functions
    result = this.handleNestedFunctions(result);
    
    // Step 3: Handle trigonometric functions
    result = this.handleTrigonometricFunctions(result);
    
    // Step 4: Handle mathematical functions
    result = this.handleMathematicalFunctions(result);
    
    // Step 5: Handle operators
    result = this.handleOperators(result);
    
    return result;
  }

  private handleConstants(expr: string): string {
    return expr
      .replace(/π/g, 'pi')
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'e');
  }

  private handleNestedFunctions(expr: string): string {
    let result = expr;
    const maxIterations = 10;
    let iteration = 0;
    let changed = true;

    while (changed && iteration < maxIterations) {
      const before = result;
      
      result = result
        // Power functions
        .replace(/sqr\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'pow($1, 2)')
        .replace(/cube\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'pow($1, 3)')
        
        // Root functions
        .replace(/√\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'sqrt($1)')
        .replace(/∛\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'cbrt($1)')
        
        // Nth root function
        .replace(
          /nthroot\(([^,()]*(?:\([^()]*\))*[^,()]*?)(?:,\s*([^,()]*(?:\([^()]*\))*[^,()]*))?\)/g,
          (_, base, index) => {
            const rootIndex = index ? index.trim() : '2';
            if (!base || base.trim() === '') return 'sqrt(0)';
            if (!rootIndex || rootIndex === '0') return `pow(${base.trim()}, 1/2)`;
            return `pow(${base.trim()}, 1/(${rootIndex}))`;
          }
        )
        
        // Reciprocal and absolute value
        .replace(/reciprocal\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/($1)')
        .replace(/\|([^|]*(?:\|[^|]*\|)*[^|]*)\|/g, 'abs($1)');

      changed = before !== result;
      iteration++;
    }

    return result;
  }

  private handleTrigonometricFunctions(expr: string): string {
    let result = expr;
    const maxIterations = 10;
    let iteration = 0;
    let changed = true;

    while (changed && iteration < maxIterations) {
      const before = result;

      // Basic trigonometric functions
      result = result
        .replace(/\bsin\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, angle) => 
          `sin(${this.convertToRadians(angle)})`)
        .replace(/\bcos\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, angle) => 
          `cos(${this.convertToRadians(angle)})`)
        .replace(/\btan\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, angle) => 
          `tan(${this.convertToRadians(angle)})`);

      // Inverse trigonometric functions
      result = result
        .replace(/\basin\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`asin(${value})`))
        .replace(/\bacos\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`acos(${value})`))
        .replace(/\batan\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`atan(${value})`));

      // Hyperbolic functions
      result = result
        .replace(/\bsinh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'sinh($1)')
        .replace(/\bcosh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'cosh($1)')
        .replace(/\btanh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'tanh($1)')
        .replace(/\basinh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'asinh($1)')
        .replace(/\bacosh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'acosh($1)')
        .replace(/\batanh\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'atanh($1)');

      // Inverse reciprocal functions (most specific first)
      result = result
        .replace(/\bacsc\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`asin(1/(${value}))`))
        .replace(/\basec\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`acos(1/(${value}))`))
        .replace(/\bacot\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, value) =>
          this.convertFromRadians(`atan(1/(${value}))`));

      // Inverse reciprocal hyperbolic functions
      result = result
        .replace(/\bacsch\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'asinh(1/($1))')
        .replace(/\basech\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'acosh(1/($1))')
        .replace(/\bacoth\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, 'atanh(1/($1))');

      // Regular reciprocal functions
      result = result
        .replace(/\bcsc\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, angle) => 
          `1/sin(${this.convertToRadians(angle)})`)
        .replace(/\bsec\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, angle) => 
          `1/cos(${this.convertToRadians(angle)})`)
        .replace(/\bcot\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, (_, angle) => 
          `1/tan(${this.convertToRadians(angle)})`);

      // Reciprocal hyperbolic functions
      result = result
        .replace(/\bcsch\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/sinh($1)')
        .replace(/\bsech\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/cosh($1)')
        .replace(/\bcoth\(([^()]*(?:\([^()]*\))*[^()]*)\)/g, '1/tanh($1)');

      changed = before !== result;
      iteration++;
    }

    return result;
  }

  private handleMathematicalFunctions(expr: string): string {
    let result = expr;

    // Logarithmic and exponential functions
    result = result
      .replace(/(?<!a)log\(([^)]+)\)/g, 'log10($1)')
      .replace(/ln\(([^)]+)\)/g, 'log($1)')
      .replace(/log2\(([^)]+)\)/g, 'log2($1)')
      .replace(/10\^\(([^)]+)\)/g, 'pow(10, $1)')
      .replace(/2\^\(([^)]+)\)/g, 'pow(2, $1)')
      .replace(/e\^\(([^)]+)\)/g, 'exp($1)')
      .replace(/exp\(([^)]+)\)/g, 'exp($1)');

    // Additional mathematical functions
    result = result
      .replace(/abs\(([^)]+)\)/g, 'abs($1)')
      .replace(/ceil\(([^)]+)\)/g, 'ceil($1)')
      .replace(/floor\(([^)]+)\)/g, 'floor($1)')
      .replace(/round\(([^)]+)\)/g, 'round($1)')
      .replace(/rand\(\)/g, 'random()')
      .replace(/gcd\(([^)]+)\)/g, 'gcd($1)')
      .replace(/lcm\(([^)]+)\)/g, 'lcm($1)');

    // Angle conversions
    result = result
      .replace(/dms\(([^)]+)\)/g, (_, value) => {
        return `floor(${value}) + (floor((${value} - floor(${value})) * 60) / 100) + (((${value} - floor(${value})) * 60 - floor((${value} - floor(${value})) * 60)) * 60 / 10000)`;
      })
      .replace(/deg\(([^)]+)\)/g, (_, value) => {
        return `floor(${value}) + (floor((${value} - floor(${value})) * 100) / 60) + (((${value} - floor(${value})) * 100 - floor((${value} - floor(${value})) * 100)) * 100 / 3600)`;
      });

    // Special operations
    result = result
      .replace(/(\d+)!/g, 'factorial($1)')
      .replace(/(\d+(?:\.\d+)?)[eE]([+-]?\d+)/g, '$1 * 10^$2');

    // Modulo operation
    result = result
      .replace(/mod\(([^,]+),\s*([^)]+)\)/g, 'mod($1, $2)')
      .replace(/(\d+)\s+mod\s+(\d+)/g, 'mod($1, $2)');

    return result;
  }

  private handleOperators(expr: string): string {
    return expr.replace(/×/g, '*').replace(/÷/g, '/');
  }

  private convertToRadians(angle: string): string {
    if (this.angleMode === 'RAD') return angle;
    if (this.angleMode === 'DEG') return `(${angle}) * ${pi / 180}`;
    if (this.angleMode === 'GRAD') return `(${angle}) * ${pi / 200}`;
    return angle;
  }

  private convertFromRadians(expr: string): string {
    if (this.angleMode === 'RAD') return expr;
    if (this.angleMode === 'DEG') return `(${expr}) * 180/${pi}`;
    if (this.angleMode === 'GRAD') return `(${expr}) * 200/${pi}`;
    return expr;
  }
}
