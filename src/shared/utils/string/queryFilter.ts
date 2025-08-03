/**
 * Field selector type - can be a string key or a function that extracts a value
 */
type FieldSelector<T> = keyof T | ((item: T) => any)

/**
 * General-purpose filter utility for searching arrays of objects.
 * 
 * @param items - The array of objects to filter
 * @param query - The search query
 * @param fields - Fields (string keys or functions) to search in each object
 * @returns Filtered array of objects matching the query
 */
export function filterByQuery<T extends Record<string, any>>(
  items: T[], 
  query: string, 
  fields: FieldSelector<T>[] = []
): T[] {
  if (!query || !query.trim()) return items
  const normalizedQuery = query.toLowerCase().trim()

  return items.filter(item => {
    return fields.some(field => {
      let value: any = ''
      if (typeof field === 'function') {
        value = field(item)
      } else if (typeof field === 'string') {
        value = item[field]
      }
      if (Array.isArray(value)) value = value.join(' ')
      if (typeof value !== 'string') value = String(value ?? '')
      return value.toLowerCase().includes(normalizedQuery)
    })
  })
}
