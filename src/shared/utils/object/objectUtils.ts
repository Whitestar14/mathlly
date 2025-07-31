/**
 * Utility functions for object manipulation
 */

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
    if (current[key] === undefined) {
      current[key] = {}
    } else if (typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
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
      // Skip prototype properties
      if (!Object.prototype.hasOwnProperty.call(current, key)) continue
      
      // Special case for ID
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
    
    // Special case for ID
    if (key === 'id') {
      result.id = obj.id
      continue
    }
    
    const keys = key.split(separator)
    let current = result
    
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i]
      if (!current[currentKey]) {
        current[currentKey] = {}
      }
      current = current[currentKey]
    }
    
    current[keys[keys.length - 1]] = obj[key]
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
