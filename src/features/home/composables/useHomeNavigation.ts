import { computed } from 'vue'
import {
  Calculator,
  Binary,
  Palette,
  FileJson,
  ArrowRightLeft,
  FunctionSquare,
  Regex,
  LineChart,
  Shapes,
  Landmark,
  QrCode,
  Hash,
  FileDiff
} from 'lucide-vue-next'

export interface ToolItem {
  id: string
  name: string
  description: string
  path: string
  icon: any
  badge?: 'new' | 'beta' | 'soon'
  keywords: string[]
  gradient?: string
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
        },
        {
          id: 'qrcode',
          name: 'QR Code',
          description: 'Generate standard and styled QR codes.',
          path: '/tools/qrcode',
          icon: QrCode,
          keywords: ['generator', 'image', 'scan'],
          gradient: 'from-gray-500/10 to-slate-500/10 hover:from-gray-500/20 hover:to-slate-500/20'
        },
        {
          id: 'hash',
          name: 'Hash Generator',
          description: 'Generate secure MD5, SHA-1, and SHA-256 hashes.',
          path: '/tools/hash',
          icon: Hash,
          keywords: ['crypto', 'security', 'md5', 'sha']
        },
        {
          id: 'diff',
          name: 'Diff Checker',
          description: 'Compare text or code to find differences.',
          path: '/tools/diff',
          icon: FileDiff,
          badge: 'new',
          keywords: ['compare', 'text', 'code']
        }
      ]
    },
    {
      title: 'Labs',
      items: [
        {
          id: 'geometry',
          name: 'Geometry',
          description: 'Calculate area, perimeter, and volume of shapes.',
          path: '/geometry',
          icon: Shapes,
          badge: 'soon',
          keywords: ['math', 'shape', 'area']
        },
        {
          id: 'finance',
          name: 'Finance',
          description: 'Loan, mortgage, and interest calculators.',
          path: '/finance',
          icon: Landmark,
          badge: 'soon',
          keywords: ['money', 'loan', 'interest']
        },
        {
          id: 'regex',
          name: 'Regex Tester',
          description: 'Debug and test regular expressions in real-time.',
          path: '/tools/regex',
          icon: Regex,
          badge: 'new',
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
        },
        {
          id: 'graphing',
          name: 'Graphing',
          description: 'Advanced graphing calculator for mathematical functions.',
          path: '/graphing',
          icon: LineChart,
          badge: 'soon',
          keywords: ['graph', 'plot', 'math', 'chart']
        }
      ]
    }
  ])

  return {
    categories
  }
}
