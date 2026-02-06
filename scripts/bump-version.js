#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isValidVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
}

function bumpVersion(newVersion, beta = false) {
  if (!isValidVersion(newVersion)) {
    console.error('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
    process.exit(1);
  }

  const finalVersion = beta ? `${newVersion}-beta` : newVersion;

  const packagePath = path.resolve(__dirname, '../package.json');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    pkg.version = finalVersion;
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ Version bumped to ${finalVersion}`);
  } catch (error) {
    console.error('Error updating package.json:', error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const version = args.find(arg => !arg.startsWith('--'));
const isBeta = args.includes('--beta');

if (!version) {
  console.error('Please provide a version number');
  console.log('Usage: pnpm run bump <version> [--beta]');
  console.log('Example: pnpm run bump 1.0.0 --beta');
  process.exit(1);
}

bumpVersion(version, isBeta);