import { ref, computed, watch } from 'vue'

export interface RegexMatch {
  index: number
  0: string // Full match
  [key: number]: string // Capture groups
  length: number // Array length (match + groups)
  groups?: Record<string, string> // Named capture groups
}

export function useRegexTool() {
  const pattern = ref('')
  const flags = ref(['g'])
  const testString = ref('')

  const error = ref<string | null>(null)
  const matches = ref<RegexMatch[]>([])

  const availableFlags = [
    { value: 'g', label: 'Global (g)' },
    { value: 'i', label: 'Case Insensitive (i)' },
    { value: 'm', label: 'Multiline (m)' },
    { value: 's', label: 'Single Line/Dotall (s)' },
    { value: 'u', label: 'Unicode (u)' },
    { value: 'y', label: 'Sticky (y)' }
  ]

  const activeRegExp = computed<RegExp | null>(() => {
    error.value = null
    if (!pattern.value) return null
    try {
      return new RegExp(pattern.value, flags.value.join(''))
    } catch(e: any) {
      error.value = e.message
      return null
    }
  })

  // Evaluate matches whenever pattern, flags, or string changes
  const evaluate = () => {
    matches.value = []
    if (!activeRegExp.value || !testString.value) return

    const regex = activeRegExp.value

    // If not global, RegExp.exec only runs once and doesn't update lastIndex properly for loops
    if (!regex.global) {
      const match = regex.exec(testString.value)
      if (match) {
        matches.value.push(createMatchItem(match))
      }
      return
    }

    // Clone regex to avoid mutating the computed property's lastIndex explicitly
    const r = new RegExp(regex.source, regex.flags)
    let match
    let safeLoopCount = 0
    const maxLoops = 10000

    while ((match = r.exec(testString.value)) !== null) {
      if (safeLoopCount++ > maxLoops) {
        error.value = 'Stopped: Regex evaluation taking too long (infinite loop protection).'
        break
      }
      matches.value.push(createMatchItem(match))

      // If regex matches empty string, increment index to prevent infinite loop
      if (match.index === r.lastIndex) {
        r.lastIndex++
      }
    }
  }

  const createMatchItem = (execArray: RegExpExecArray): RegexMatch => {
    // Convert to plain object to store reacting safely
    const item: any = {
      index: execArray.index,
      length: execArray.length,
      groups: execArray.groups
    }
    for (let i = 0; i < execArray.length; i++) {
      item[i] = execArray[i]
    }
    return item as RegexMatch
  }

  watch([activeRegExp, testString], evaluate, { immediate: true })

  const clear = () => {
    pattern.value = ''
    testString.value = ''
    matches.value = []
    error.value = null
  }

  const loadSample = () => {
    pattern.value = '([A-Z])\\w+'
    flags.value = ['g']
    testString.value = 'Hello World! This is a Regex match. 12345'
  }

  return {
    pattern,
    flags,
    testString,
    availableFlags,
    error,
    matches,
    evaluate,
    clear,
    loadSample
  }
}
