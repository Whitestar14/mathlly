import { defineStore } from 'pinia'
import pkg from '../../../package.json'

// Define interfaces for version information
interface VersionInfo {
  full: string
  major: string
  minor: string
  patch: string
  isBeta: boolean
}

interface VersionState {
  version: string
  buildDate: string
}

export const useVersionStore = defineStore('version', {
  state: (): VersionState => ({
    version: pkg.version,
    buildDate: new Date().toISOString()
  }),
  
  getters: {
    versionInfo: (state): VersionInfo => {
      const versionParts = state.version.split('.')
      return {
        full: state.version,
        major: versionParts[0] || '0',
        minor: versionParts[1] || '0', 
        patch: versionParts[2] || '0',
        isBeta: state.version.includes('beta')
      }
    }
  }
})
