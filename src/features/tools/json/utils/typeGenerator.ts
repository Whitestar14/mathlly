/**
 * Generates TypeScript interface definitions from a JSON object.
 * @param json The JSON object to parse.
 * @param rootName The name of the root interface.
 * @returns A string containing the TypeScript definitions.
 */
export function generateTypeScript(json: any, rootName = 'RootObject'): string {
  const interfaces = new Map<string, string>()
  const seenObjects = new Map<string, string>() // Signature -> InterfaceName

  function getType(value: any): string {
    if (value === null) return 'any'
    const type = typeof value
    if (type !== 'object') {
      if (type === 'number') return Number.isInteger(value) ? 'number' : 'number'
      return type
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]'
      // Simplification: check the first item for array type, or union if mixed (not fully implemented for brevity)
      const firstItemType = getType(value[0])
      return `${firstItemType}[]`
    }
    return 'object'
  }

  function generateInterfaceName(hint: string): string {
    let name = hint.charAt(0).toUpperCase() + hint.slice(1)
    if (!name.endsWith('Object') && !name.endsWith('Item')) {
       // Keep simple names
    }
    // Ensure uniqueness handled by logic structure below
    return name
  }

  function traverse(obj: any, name: string): string {
    if (obj === null) return 'any'
    if (typeof obj !== 'object') return getType(obj)
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'any[]'
      // Check all items to see if they are objects that need interfaces
      const types = new Set<string>()
      obj.forEach(item => {
        types.add(traverse(item, name.endsWith('s') ? name.slice(0, -1) : name + 'Item'))
      })
      const uniqueTypes = Array.from(types)
      if (uniqueTypes.length === 1) return `${uniqueTypes[0]}[]`
      return `(${uniqueTypes.join(' | ')})[]`
    }

    // Object handling
    // Check if we've seen this object structure before to deduplicate interfaces
    const keys = Object.keys(obj).sort()
    const signature = keys.map(k => `${k}:${getType(obj[k])}`).join(';')
    
    if (seenObjects.has(signature)) {
        return seenObjects.get(signature)!
    }

    const interfaceName = generateInterfaceName(name)
    let uniqueName = interfaceName
    let counter = 1
    while (interfaces.has(uniqueName)) {
        uniqueName = `${interfaceName}${counter++}`
    }
    
    seenObjects.set(signature, uniqueName)

    const props = keys.map(key => {
      const value = obj[key]
      const type = traverse(value, key)
      // Optional check could go here if we were comparing multiple array items
      return `  ${key}: ${type};`
    })

    const definition = `interface ${uniqueName} {\n${props.join('\n')}\n}`
    interfaces.set(uniqueName, definition)
    
    return uniqueName
  }

  traverse(json, rootName)

  // Return all interfaces joined
  return Array.from(interfaces.values()).reverse().join('\n\n')
}
