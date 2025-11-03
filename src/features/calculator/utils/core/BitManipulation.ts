export type BitWidth = 16 | 32 | 64
export interface BitArray { bits: boolean[]; width: BitWidth } // LSB-first: bits[0] = bit 0

function validateBitPosition(position: number, width: BitWidth) {
  if (position < 0 || position >= width) throw new Error(`Bit position ${position} out of range for ${width}-bit`)
}

function extractBitsFromNumber(value: number, width: BitWidth): boolean[] {
  const val = width === 16 ? (value & 0xFFFF) >>> 0 : width === 32 ? value >>> 0 : value
  const bits = new Array(width)
  for (let i = 0; i < width; i++) bits[i] = ((val >>> i) & 1) === 1
  return bits
}

function extractBitsFromBigInt(value: bigint, width: BitWidth): boolean[] {
  const val = BigInt.asUintN(64, value)
  const bits = new Array(width)
  for (let i = 0; i < width; i++) bits[i] = ((val >> BigInt(i)) & 1n) === 1n
  return bits
}

export function decimalToBits(value: number, width: BitWidth): BitArray {
  return width === 64 ?
    { bits: extractBitsFromBigInt(BigInt(value), width), width } :
    { bits: extractBitsFromNumber(value, width), width }
}

export function bitsToDecimal(bits: boolean[], width: BitWidth, opts?: { signed?: boolean }): number {
  const signed = !!opts?.signed
  if (width === 64) {
    let v = 0n
    for (let i = 0; i < width; i++) if (bits[i]) v |= 1n << BigInt(i)
    v = signed ? BigInt.asIntN(64, v) : BigInt.asUintN(64, v)
    return Number(v) // precision warning > 2^53-1
  } else {
    let v = 0 >>> 0
    for (let i = 0; i < width; i++) if (bits[i]) v |= (1 << i) >>> 0
    if (width === 16) v &= 0xFFFF
    if (width === 32) v >>>= 0
    if (signed && bits[width - 1]) {
      if (width === 16) v = (v << 16) >> 16
      else v = v >> 0
    }
    return v
  }
}

export function toggleBit(value: number, bitPosition: number, width: BitWidth): number {
  validateBitPosition(bitPosition, width)
  const arr = decimalToBits(value, width)
  arr.bits[bitPosition] = !arr.bits[bitPosition]
  return bitsToDecimal(arr.bits, width)
}

export function getBitValue(value: number, bitPosition: number, width: BitWidth): boolean {
  validateBitPosition(bitPosition, width)
  return decimalToBits(value, width).bits[bitPosition]
}

export function setBit(value: number, bitPosition: number, width: BitWidth, bitValue: boolean): number {
  validateBitPosition(bitPosition, width)
  const arr = decimalToBits(value, width)
  arr.bits[bitPosition] = bitValue
  return bitsToDecimal(arr.bits, width)
}

export function maskValue(value: number, width: BitWidth): number {
  if (width === 16) return value & 0xFFFF
  if (width === 32) return value >>> 0
  const masked = BigInt.asUintN(64, BigInt(value))
  return Number(masked) // precision caveat
}
