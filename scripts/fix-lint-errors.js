#!/usr/bin/env node

/**
 * Fix Lint Errors Script
 * Automatically fixes common linting issues
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Fixing lint errors...\n')

// Run ESLint with auto-fix
try {
  console.log('Running ESLint auto-fix...')
  execSync('npx eslint . --fix --ext .ts,.tsx,.js,.jsx', { stdio: 'inherit' })
  console.log('✅ ESLint auto-fix completed\n')
} catch (error) {
  console.log('⚠️ Some errors could not be auto-fixed\n')
}

// Fix common issues manually
const fixes = [
  {
    pattern: /`([^`]*)'([^`]*)`/g,
    replacement: '`$1&apos;$2`',
    description: 'Fix unescaped apostrophes in JSX'
  },
  {
    pattern: /`([^`]*)"([^`]*)"([^`]*)`/g,
    replacement: '`$1&ldquo;$2&rdquo;$3`',
    description: 'Fix unescaped quotes in JSX'
  }
]

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return
  
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false
  
  fixes.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement)
    if (newContent !== content) {
      content = newContent
      changed = true
    }
  })
  
  if (changed) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Fixed: ${filePath}`)
  }
}

// Find and fix files
const srcDir = path.join(__dirname, '../src')
function walkDir(dir) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      walkDir(filePath)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath)
    }
  })
}

walkDir(srcDir)

console.log('\n🎯 Manual fixes needed:')
console.log('  • Remove unused imports')
console.log('  • Add alt props to images')
console.log('  • Fix React Hook dependencies')
console.log('  • Replace <img> with <Image> from next/image')

console.log('\n✅ Auto-fixable errors resolved!')
