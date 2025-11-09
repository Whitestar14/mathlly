export type PreRelease = 'alpha' | 'beta' | 'rc' | null

export interface VersionInfo {
  major: number
  minor: number
  patch: number
  prerelease: PreRelease
  prereleaseNumber: number
  isStable: boolean
}

export function parseVersion(v: string): VersionInfo | null {
  const cleaned = v.replace(/^v/, '')
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)(?:-(beta|alpha|rc)(\d*))?$/)
  if (!match) return null

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: (match[4] as PreRelease) || null,
    prereleaseNumber: match[5] ? parseInt(match[5], 10) : 0,
    isStable: !match[4]
  }
}

export function isNewerVersion(latest: string, current: string): boolean {
  if (!latest || !current || latest === 'Service Worker Update') return false

  const latestParsed = parseVersion(latest)
  const currentParsed = parseVersion(current)
  if (!latestParsed || !currentParsed) return false

  // Major/minor/patch precedence
  if (latestParsed.major !== currentParsed.major) return latestParsed.major > currentParsed.major
  if (latestParsed.minor !== currentParsed.minor) return latestParsed.minor > currentParsed.minor
  if (latestParsed.patch !== currentParsed.patch) return latestParsed.patch > currentParsed.patch

  // Prerelease semantics
  if (currentParsed.prerelease && latestParsed.isStable) return true
  if (currentParsed.isStable && latestParsed.prerelease) return false

  if (currentParsed.prerelease && latestParsed.prerelease) {
    const order: Record<NonNullable<PreRelease>, number> = { alpha: 1, beta: 2, rc: 3 }
    if (currentParsed.prerelease === latestParsed.prerelease) {
      return latestParsed.prereleaseNumber > currentParsed.prereleaseNumber
    }
    return order[latestParsed.prerelease!] > order[currentParsed.prerelease!]
  }

  return false
}

export const formatVersion = (version: string): string => {
  if (!version) return ''
  if (version === 'Service Worker Update' || version === 'SW Update') return 'SW Update'
  const cleanVersion = version.replace(/^v/, '')
  if (cleanVersion.includes('beta')) {
    const [versionNum] = cleanVersion.split('-')
    return `${versionNum} β`
  }
  if (cleanVersion.includes('alpha')) {
    const [versionNum] = cleanVersion.split('-')
    return `${versionNum} α`
  }
  return cleanVersion
}
