import { ref, readonly } from 'vue'

export type Base64Tab = 'encode' | 'decode'

const currentTab = ref<Base64Tab>('encode')

export function useBase64TabSwitcher() {
  const setTab = (tab: Base64Tab) => {
    currentTab.value = tab
  }

  return {
    currentTab: readonly(currentTab),
    setTab
  }
}

export { currentTab as globalBase64Tab }
