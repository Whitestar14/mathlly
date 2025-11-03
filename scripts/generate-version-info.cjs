const fs = require('fs')
const path = require('path')

let pkg
try {
  pkg = require('../package.json')
} catch(error) {
  console.error('❌ Failed to read package.json:', error.message)
  process.exit(1)
}

const changelogPath = path.resolve(__dirname, '../src/shared/services/storage/changelog.json')
const publicDir = path.resolve(__dirname, '../public')

let versionInfo

/**
 * Parse version into components for better comparison
 */
function parseVersion(version) {
  if (!version || typeof version !== 'string') return null

  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(beta|alpha|rc)(\d*))?$/)
  if (!match) return null

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    prereleaseNumber: match[5] ? parseInt(match[5], 10) : 0,
    isBeta: match[4] === 'beta',
    isAlpha: match[4] === 'alpha',
    isStable: !match[4],
    raw: version
  }
}

/**
 * Determine update type based on version comparison
 */
function getUpdateType(currentVersion, latestVersion) {
  const current = parseVersion(currentVersion)
  const latest = parseVersion(latestVersion)

  if (!current || !latest) return 'unknown'

  if (latest.major > current.major) {
    return latest.isBeta ? 'major-beta' : 'major'
  }

  if (latest.minor > current.minor) {
    return latest.isBeta ? 'minor-beta' : 'minor'
  }

  if (latest.patch > current.patch) {
    return latest.isBeta ? 'patch-beta' : 'patch'
  }

  if (current.major === latest.major &&
    current.minor === latest.minor &&
    current.patch === latest.patch) {
    if (current.isBeta && latest.isStable) {
      return 'beta-to-stable'
    }

    if (current.isBeta && latest.isBeta && latest.prereleaseNumber > current.prereleaseNumber) {
      return 'beta-increment'
    }

    if (current.isStable && latest.isBeta) {
      return 'stable-to-beta'
    }
  }

  return 'patch'
}

/**
 * Generate fallback version info
 */
function generateFallback(reason, error = null) {
  const fallbackVersion = pkg?.version || '0.0.1'
  const currentDate = new Date().toISOString().split('T')[0]

  console.log(`⚠️  ${reason}${error ? ': ' + error.message : ''}`)
  console.log(`📝 Generating fallback version info for ${fallbackVersion}`)

  return {
    version: fallbackVersion,
    date: currentDate,
    features: [],
    fullFeatures: [],
    hasChangelog: false,
    source: 'fallback',
    message: 'No updates available',
    fallbackReason: reason,
    updateType: 'none',
    versionInfo: parseVersion(fallbackVersion)
  }
}

try {
  if (!fs.existsSync(changelogPath)) {
    versionInfo = generateFallback('Changelog file not found at: ' + changelogPath)
  } else {
    let changelogData
    try {
      const changelogContent = fs.readFileSync(changelogPath, 'utf8')

      if (!changelogContent.trim()) {
        versionInfo = generateFallback('Changelog file is empty')
      } else {
        changelogData = JSON.parse(changelogContent)
      }
    } catch(parseError) {
      if (parseError instanceof SyntaxError) {
        versionInfo = generateFallback('Invalid JSON in changelog file', parseError)
      } else {
        versionInfo = generateFallback('Failed to read changelog file', parseError)
      }
    }

    if (changelogData && !versionInfo) {
      if (!changelogData.updates) {
        versionInfo = generateFallback('Changelog missing "updates" property')
      } else if (!Array.isArray(changelogData.updates)) {
        versionInfo = generateFallback('Changelog "updates" is not an array')
      } else if (changelogData.updates.length === 0) {
        versionInfo = generateFallback('Changelog "updates" array is empty')
      } else {
        const latestUpdate = changelogData.updates[0]

        if (!latestUpdate || typeof latestUpdate !== 'object') {
          versionInfo = generateFallback('Latest update is not a valid object')
        } else {
          const validatedFeatures = Array.isArray(latestUpdate.features) ? latestUpdate.features : []
          const cleanFeatures = validatedFeatures.filter(f => typeof f === 'string' && !f.startsWith('@'))
          const updateType = getUpdateType(pkg.version, latestUpdate.version)

          versionInfo = {
            version: latestUpdate.version,
            date: latestUpdate.date || new Date().toISOString().split('T')[0],
            features: cleanFeatures.slice(0, 8),
            fullFeatures: validatedFeatures,
            hasChangelog: true,
            source: 'changelog',
            currentDeployedVersion: pkg.version,
            totalUpdates: changelogData.updates.length,
            updateType: updateType,
            versionInfo: parseVersion(latestUpdate.version),
            currentVersionInfo: parseVersion(pkg.version)
          }

          console.log('✅ Generated version-info.json successfully')
          console.log(`📦 Current deployed: ${pkg.version}`)
          console.log(`🆕 Latest available: ${latestUpdate.version}`)
          console.log(`🔄 Update type: ${updateType}`)
          console.log(`📝 Features: ${cleanFeatures.length} (${validatedFeatures.length} total)`)
        }
      }
    }
  }
} catch(error) {
  versionInfo = generateFallback('Unexpected error occurred', error)
}

if (!versionInfo) {
  versionInfo = generateFallback('Unknown error - no version info generated')
}

try {
  if (!fs.existsSync(publicDir)) {
    console.log(`📁 Creating public directory: ${publicDir}`)
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const versionInfoPath = path.resolve(publicDir, 'version-info.json')
  fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2))

  console.log(`✅ Successfully wrote version-info.json to ${versionInfoPath}`)
} catch(writeError) {
  console.error('❌ Failed to write version-info.json:', writeError.message)
  process.exit(1)
}
