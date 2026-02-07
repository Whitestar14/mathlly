import { markRaw } from 'vue'
import {
  CompassIcon,
  Code2Icon,
  InfoIcon,
  MessagesSquareIcon,
  CogIcon,
  SparklesIcon,
  PaletteIcon,
  FunctionSquareIcon,
  RegexIcon,
  LineChartIcon,
  ArrowRightLeftIcon,
  BinaryIcon,
  FileJson2Icon
} from 'lucide-vue-next'

export interface NavigationItem {
  name: string
  path: string
  icon: any
  comingSoon?: boolean
  isNew?: boolean
  description?: string
}

export interface NavigationCategory {
  title: string
  items: NavigationItem[]
}

export interface FooterItem {
  key: string
  path: string
  icon: any
  label: string
}

/**
 * Composable for sidebar navigation configuration
 */
export function useSidebarNavigation() {
  const categories = markRaw<NavigationCategory[]>([
    {
      title: 'Navigation',
      items: [
        {
          name: 'Home',
          path: '/',
          icon: CompassIcon,
          comingSoon: false,
          isNew: false
        }
      ]
    },
    {
      title: 'Calculators',
      items: [
        {
          name: 'Calculator',
          path: '/calculator',
          icon: Code2Icon,
          comingSoon: false,
          isNew: false
        },
        {
          name: 'Converter',
          path: '/converter',
          icon: ArrowRightLeftIcon,
          comingSoon: false,
          isNew: false
        },
        {
          name: 'Functions',
          path: '/functions',
          icon: FunctionSquareIcon,
          comingSoon: true
        },
        {
          name: 'Regex',
          path: '/regex',
          icon: RegexIcon,
          comingSoon: true
        },
        {
          name: 'Graphing',
          path: '/graphing',
          icon: LineChartIcon,
          comingSoon: true
        }
      ]
    },
    {
      title: 'Tools',
      items: [
        {
          name: 'Base64',
          path: '/tools/base64',
          icon: BinaryIcon,
          isNew: false,
          comingSoon: false,
          description: 'Encode and decode Base64 strings'
        },
        {
          name: 'Color',
          path: '/tools/color',
          icon: PaletteIcon,
          isNew: false,
          comingSoon: false,
          description: 'Convert and preview colors (hex, rgb, cmyk, oklch)'
        },
        {
          name: 'JSON Editor',
          path: '/tools/json',
          icon: FileJson2Icon,
          isNew: true,
          description: 'Description here...'
        },
      ]
    },
    {
      title: 'Information',
      items: [
        {
          name: 'Updates',
          path: '/info/update',
          comingSoon: false,
          icon: SparklesIcon
        },
        {
          name: 'About',
          path: '/info/about',
          comingSoon: false,
          icon: InfoIcon
        }
      ]
    }
  ])

  const footerItems = markRaw<FooterItem[]>([
    {
      key: 'settings',
      path: '/settings',
      icon: CogIcon,
      label: 'Settings'
    },
    {
      key: 'feedback',
      path: '/feedback',
      icon: MessagesSquareIcon,
      label: 'Send Feedback'
    }
  ])

  return {
    categories,
    footerItems
  }
}
