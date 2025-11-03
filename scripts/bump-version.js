#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function isValidVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+$/
  return versionRegex.test(version)
}

function bumpVersion(newVersion, beta = false) {
  if (!isValidVersion(newVersion)) {
    console.error('Invalid version format. Use semantic versioning (e.g., 1.0.0)')
    process.exit(1)
  }

  const finalVersion = beta ? `${newVersion}-beta` : newVersion

  const packagePath = path.join(__dirname, '../package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  pkg.version = finalVersion
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')

  console.log(`Version bumped to ${finalVersion}`)
}

const args = process.argv.slice(2)
const version = args[0]
const isBeta = args.includes('--beta')

if (!version) {
  console.error('Please provide a version number')
  console.log('Usage: node bump-version.js <version> [--beta]')
  console.log('Example: node bump-version.js 1.0.0 --beta')
  process.exit(1)
}

bumpVersion(version, isBeta)
