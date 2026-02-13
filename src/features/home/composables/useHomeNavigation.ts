
import { computed } from 'vue'
import { 
  Calculator, 
  Binary, 
  Palette, 
  FileJson, 
  ArrowRightLeft, 
  FunctionSquare, 
  Regex, 
  LineChart 
} from 'lucide-vue-next'

export interface ToolItem {
  id: string
  name: string
  description: string
  path: string
  icon: any
  badge?: 'new' | 'beta' | 'soon'
  keywords: string[]
  gradient?: string // New property for visual flair
}

export interface ToolCategory {
  title: string
  items: ToolItem[]
}

export function useHomeNavigation() {
  const categories = computed<ToolCategory[]>(() => [
    {
      title: 'Essentials',
      items: [
        {
          id: 'calculator',
          name: 'Calculator',
          description: 'Precision arithmetic with Standard, Scientific, and Programmer modes.',
          path: '/calculator',
          icon: Calculator,
          keywords: ['math', 'calculate', 'scientific', 'programmer'],
          gradient: 'from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20'
        },
        {
          id: 'converter',
          name: 'Converter',
          description: 'Transform values across 14+ categories including currency & data.',
          path: '/converter',
          icon: ArrowRightLeft,
          keywords: ['unit', 'currency', 'measurement'],
          gradient: 'from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20'
        }
      ]
    },
    {
      title: 'Dev Utilities',
      items: [
        {
          id: 'json',
          name: 'JSON Editor',
          description: 'Validate, format, minify, and explore JSON structures.',
          path: '/tools/json',
          icon: FileJson,
          badge: 'new',
          keywords: ['format', 'lint', 'xml', 'csv'],
          gradient: 'from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20'
        },
        {
          id: 'base64',
          name: 'Base64',
          description: 'Encode/decode text & files with real-time preview.',
          path: '/tools/base64',
          icon: Binary,
          keywords: ['encode', 'decode', 'file', 'image'],
          gradient: 'from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20'
        },
        {
          id: 'color',
          name: 'Color Studio',
          description: 'Advanced palette generation, contrast checking, and extraction.',
          path: '/tools/color',
          icon: Palette,
          keywords: ['hex', 'rgb', 'picker', 'accessibility'],
          gradient: 'from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20'
        }
      ]
    },
    {
      title: 'Labs',
      items: [
        {
          id: 'regex',
          name: 'Regex Tester',
          description: 'Debug and test regular expressions in real-time.',
          path: '/regex',
          icon: Regex,
          badge: 'soon',
          keywords: ['regexp', 'pattern', 'match']
        },
        {
          id: 'functions',
          name: 'Plotter',
          description: 'Visualize mathematical functions on a Cartesian plane.',
          path: '/functions',
          icon: FunctionSquare,
          badge: 'soon',
          keywords: ['graph', 'plot', 'math']
        }
      ]
    }
  ])

  return {
    categories
  }
}
