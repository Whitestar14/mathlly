import { computed } from 'vue'
import { useAppStorageStore } from '@stores/appStorage'
import {
  Calculator,
  ArrowRightLeft,
  Palette,
  Binary,
  FileJson,
  Rocket,
  Hash,
  Diff,
  Regex
} from 'lucide-vue-next'

export function useDashboardData() {
  const storage = useAppStorageStore()

  const lastPath = computed(() => storage.get('router', 'lastVisitedPath', ''))

  const lastActiveTime = computed(() => {
    const ts = storage.get('router', 'lastVisitedTime', 0)
    return ts ? new Date(ts) : null
  })

  const hasHistory = computed(() => {
    const p = lastPath.value
    return p && p !== '/' && p !== '/dashboard'
  })

  const resumeContext = computed(() => {
    const path = lastPath.value

    if (path.includes('calculator')) {
      return { type: 'calculator', label: 'Calculator', icon: Calculator, detail: 'Resume Calculation' }
    }
    if (path.includes('converter')) {
      return { type: 'converter', label: 'Unit Converter', icon: ArrowRightLeft, detail: 'Convert Units' }
    }
    if (path.includes('color')) {
      const color = storage.get('router', 'lastUsedColor', undefined)
      return {
        type: 'color',
        label: 'Color Studio',
        icon: Palette,
        detail: color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` : 'Resume Editing',
        colorData: color
      }
    }
    if (path.includes('base64')) {
      return { type: 'base64', label: 'Base64 Tool', icon: Binary, detail: 'Encode / Decode' }
    }
    if (path.includes('json')) {
      return { type: 'json', label: 'JSON Editor', icon: FileJson, detail: 'Format & Validate' }
    }
    if (path.includes('hash')) {
      return { type: 'hash', label: 'Hash Generator', icon: Hash, detail: 'Generate Hashes' }
    }
    if (path.includes('diff')) {
      return { type: 'diff', label: 'Diff Checker', icon: Diff, detail: 'Compare Texts and Code' }
    }
    if (path.includes('regex')) {
      return { type: 'regex', label: 'Regex Tester', icon: Regex, detail: 'Test Patterns' }
    }

    return {
      type: 'new',
      label: 'Start Creating',
      icon: Rocket,
      detail: 'Explore the developer toolkit'
    }
  })

  return {
    lastPath,
    resumeContext,
    lastActiveTime,
    hasHistory
  }
}
