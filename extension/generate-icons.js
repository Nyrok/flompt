#!/usr/bin/env node
/**
 * generate-icons.js
 * Generates the extension's PNG icons from icons/icon.svg
 * Usage: node generate-icons.js
 * Dependency: npm install sharp  (or: npm install sharp --prefix /tmp/flompt-tools)
 */

const path = require('path')
const fs   = require('fs')

// Look for sharp locally or in /tmp/flompt-tools
let sharp
try {
  sharp = require('sharp')
} catch {
  try {
    sharp = require('/tmp/flompt-tools/node_modules/sharp')
  } catch {
    console.error('❌ sharp not found. Run: npm install sharp --prefix /tmp/flompt-tools')
    process.exit(1)
  }
}

const ICONS_DIR = path.join(__dirname, 'icons')
const SOURCE    = path.join(ICONS_DIR, 'icon.svg')

const SIZES = [16, 32, 48, 128]

async function run() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`❌ Source not found: ${SOURCE}`)
    process.exit(1)
  }

  console.log(`📦 Generating icons from icons/icon.svg…\n`)

  for (const size of SIZES) {
    const dest = path.join(ICONS_DIR, `icon${size}.png`)
    await sharp(SOURCE)
      .resize(size, size)
      .png()
      .toFile(dest)
    console.log(`  ✓ icon${size}.png  (${size}×${size}px)`)
  }

  console.log(`\n✅ ${SIZES.length} icons generated in icons/`)
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
