/**
 * Utility functions for object manipulation
 */

// Prevent prototype pollution by checking for dangerous keys
function isValidKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

/**
 * Deep clone an object
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  const clone = (Array.isArray(obj) ? [] : {}) as T

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (isValidKey(key)) continue;
      (clone as any)[key] = cloneDeep((obj as any)[key])
    }
  }

  return clone
}

/**
 * Deep merge objects
 */
export function merge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Partial<T> | Record<string, any>>
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isValidKey(key)) continue;

      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        merge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return merge(target, ...sources)
}

/**
 * Check if value is an object
 */
export function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item))
}

/**
 * Get a value from an object by path
 */
export function get<T = any>(
  obj: Record<string, any>,
  path: string | string[],
  defaultValue?: T
): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue as T
  }

  const keys = Array.isArray(path) ? path : path.split('.')
  let result: any = obj

  for (const key of keys) {
    if (isValidKey(key)) return defaultValue as T;

    if (result === undefined || result === null) {
      return defaultValue as T
    }
    result = result[key]
  }

  return result === undefined ? (defaultValue as T) : result
}

/**
 * Set a value in an object by path
 */
export function set(
  obj: Record<string, any>,
  path: string | string[],
  value: any
): Record<string, any> {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const keys = Array.isArray(path) ? path : path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (isValidKey(key)) return obj;

    if (current[key] === undefined) {
      current[key] = {}
    } else if (typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  if (isValidKey(lastKey)) return obj;

  current[lastKey] = value
  return obj
}

/**
 * Flattens a nested object structure with path-based keys
 */
export function flattenObject(
  obj: Record<string, any>,
  separator: string = '_'
): Record<string, any> {
  const result: Record<string, any> = {}

  function flatten(current: Record<string, any>, prefix: string = ''): void {
    for (const key in current) {
      if (!Object.prototype.hasOwnProperty.call(current, key)) continue
      if (isValidKey(key)) continue;

      if (key === 'id' && prefix === '') {
        result[key] = current[key]
        continue
      }

      const newKey = prefix ? `${prefix}${separator}${key}` : key

      if (isObject(current[key]) && !Array.isArray(current[key])) {
        flatten(current[key], newKey)
      } else {
        result[newKey] = current[key]
      }
    }
  }

  flatten(obj)
  return result
}

/**
 * Unflatten an object with path-based keys into a nested structure
 */
export function unflattenObject(
  obj: Record<string, any>,
  separator: string = '_'
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    if (isValidKey(key)) continue;

    if (key === 'id') {
      result.id = obj.id
      continue
    }

    const keys = key.split(separator)
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
          const currentKey = keys[i]
          if (isValidKey(currentKey)) break;

      if (!current[currentKey]) {
        current[currentKey] = {}
      }
      current = current[currentKey]
    }

    const lastKey = keys[keys.length - 1]
    if (lastKey !== '__proto__' && lastKey !== 'constructor' && lastKey !== 'prototype') {
      current[lastKey] = obj[key]
    }
  }

  return result
}

/**
 * Determines if the given object contains at least one nested object (excluding arrays).
 */
export function isNestedStructure(obj: any): obj is Record<string, any> {
  if (!obj || typeof obj !== 'object') return false
  return Object.keys(obj).some(key =>
    obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
  )
}
