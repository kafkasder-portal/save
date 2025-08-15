#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import mapping rules
const importMappings = [
  // UI Components
  {
    pattern: /from ['"]\.\.\/\.\.\/ui\/([^'"]+)['"]/g,
    replacement: "from '@ui/$1'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/ui\/([^'"]+)['"]/g,
    replacement: "from '@ui/$1'"
  },
  // Lib
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
    replacement: "from '@lib/$1'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
    replacement: "from '@lib/$1'"
  },
  // Components
  {
    pattern: /from ['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g,
    replacement: "from '@components/$1'"
  },
  // Hooks
  {
    pattern: /from ['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]/g,
    replacement: "from '@hooks/$1'"
  },
  // Utils
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g,
    replacement: "from '@utils/$1'"
  },
  // Types
  {
    pattern: /from ['"]\.\.\/\.\.\/types\/([^'"]+)['"]/g,
    replacement: "from '@types/$1'"
  },
  // Pages
  {
    pattern: /from ['"]\.\.\/\.\.\/pages\/([^'"]+)['"]/g,
    replacement: "from '@pages/$1'"
  },
  // Store
  {
    pattern: /from ['"]\.\.\/\.\.\/store\/([^'"]+)['"]/g,
    replacement: "from '@store/$1'"
  },
  // Contexts
  {
    pattern: /from ['"]\.\.\/\.\.\/contexts\/([^'"]+)['"]/g,
    replacement: "from '@contexts/$1'"
  },
  // Services
  {
    pattern: /from ['"]\.\.\/\.\.\/services\/([^'"]+)['"]/g,
    replacement: "from '@services/$1'"
  },
  // Constants
  {
    pattern: /from ['"]\.\.\/\.\.\/constants\/([^'"]+)['"]/g,
    replacement: "from '@constants/$1'"
  },
  // Validators
  {
    pattern: /from ['"]\.\.\/\.\.\/validators\/([^'"]+)['"]/g,
    replacement: "from '@validators/$1'"
  }
]

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    let hasChanges = false

    importMappings.forEach(mapping => {
      const matches = content.match(mapping.pattern)
      if (matches) {
        newContent = newContent.replace(mapping.pattern, mapping.replacement)
        hasChanges = true
        console.log(`  Updated imports in ${path.relative(process.cwd(), filePath)}`)
      }
    })

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8')
      return true
    }
    return false
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
    return false
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)
  let updatedFiles = 0

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      updatedFiles += walkDir(filePath)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (processFile(filePath)) {
        updatedFiles++
      }
    }
  })

  return updatedFiles
}

console.log('🚀 Starting import migration...')
console.log('📁 Scanning src directory for TypeScript/React files...')

const srcDir = path.join(__dirname, '..', 'src')
const updatedFiles = walkDir(srcDir)

console.log(`\n✅ Migration complete!`)
console.log(`📊 Updated ${updatedFiles} files`)
console.log(`\n🎯 New import aliases available:`)
console.log(`   @ui/*     -> src/components/ui/*`)
console.log(`   @lib/*    -> src/lib/*`)
console.log(`   @components/* -> src/components/*`)
console.log(`   @hooks/*  -> src/hooks/*`)
console.log(`   @utils/*  -> src/utils/*`)
console.log(`   @types/*  -> src/types/*`)
console.log(`   @pages/*  -> src/pages/*`)
console.log(`   @store/*  -> src/store/*`)
console.log(`   @contexts/* -> src/contexts/*`)
console.log(`   @services/* -> src/services/*`)
console.log(`   @constants/* -> src/constants/*`)
console.log(`   @validators/* -> src/validators/*`)
console.log(`\n💡 Example usage:`)
console.log(`   import { Button } from '@ui/button'`)
console.log(`   import { supabase } from '@lib/supabase'`)
console.log(`   import { useAuth } from '@hooks/useAuth'`)
