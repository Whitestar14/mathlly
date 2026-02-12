
import { computed } from 'vue'
import { useAppStorageStore } from '@stores/appStorage'
import { useCalculatorSession } from '@calculator/composables/useCalculatorSession'
import { useRouter } from 'vue-router'
import type { CalculatorMode } from '@calculator/composables/useCalculatorState'

export function useDashboardData() {
  const storage = useAppStorageStore()
  const router = useRouter()
  const calcSession = useCalculatorSession()

  // 1. Smart Resume Logic
  const lastPath = computed(() => storage.get('router', 'lastVisitedPath', ''))
  
  const resumeContext = computed(() => {
    const path = lastPath.value
    
    if (path.includes('calculator')) {
      return {
        type: 'calculator',
        label: 'Calculator',
        icon: 'Calculator',
        detail: 'Resume Calculation'
      }
    }
    if (path.includes('converter')) {
      return {
        type: 'converter',
        label: 'Unit Converter',
        icon: 'ArrowRightLeft',
        detail: 'Convert Units'
      }
    }
    if (path.includes('color')) {
      const color = storage.get('router', 'lastUsedColor', undefined)
      return {
        type: 'color',
        label: 'Color Tool',
        icon: 'Palette',
        detail: color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` : 'Resume Editing',
        colorData: color
      }
    }
    
    return {
      type: 'generic',
      label: 'Welcome Back',
      icon: 'Sparkles',
      detail: 'Start a new task'
    }
  })

  // 2. Quick Math Logic
  const runQuickMath = (expression: string) => {
    if (!expression) return
    
    // Determine mode based on input (hex/bin detection could go here)
    const mode: CalculatorMode = 'Standard'
    
    // Pre-seed the calculator session
    calcSession.saveInput(mode, expression)
    
    router.push('/calculator')
  }

  return {
    lastPath,
    resumeContext,
    runQuickMath
  }
}
