#!/usr/bin/env node

/**
 * Bundle analiz scripti
 * Vite build sonrasında bundle boyutlarını ve bağımlılıkları analiz eder
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Bundle analysis configuration
const config = {
  buildDir: 'dist',
  reportDir: 'reports',
  thresholds: {
    totalSize: 1024 * 1024, // 1MB
    chunkSize: 500 * 1024, // 500KB
    vendorSize: 800 * 1024, // 800KB
  }
}

// Ensure reports directory exists
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true })
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Helper function to get file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    console.warn(`Could not get size for ${filePath}:`, error.message)
    return 0
  }
}

// Analyze bundle structure
function analyzeBundle() {
  console.log('🔍 Analyzing bundle...')
  
  const buildPath = path.resolve(config.buildDir)
  const files = []
  
  // Recursively get all files in build directory
  function getFiles(dir) {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        getFiles(fullPath)
      } else if (stat.isFile()) {
        const relativePath = path.relative(buildPath, fullPath)
        const size = stat.size
        
        files.push({
          path: relativePath,
          size,
          formattedSize: formatBytes(size),
          type: path.extname(item).slice(1) || 'unknown'
        })
      }
    }
  }
  
  getFiles(buildPath)
  
  // Sort by size (largest first)
  files.sort((a, b) => b.size - a.size)
  
  return files
}

// Analyze chunks
function analyzeChunks(files) {
  console.log('📦 Analyzing chunks...')
  
  const chunks = {
    js: files.filter(f => f.type === 'js'),
    css: files.filter(f => f.type === 'css'),
    assets: files.filter(f => !['js', 'css', 'html'].includes(f.type))
  }
  
  const analysis = {
    total: {
      files: files.length,
      size: files.reduce((sum, f) => sum + f.size, 0)
    },
    chunks: {
      js: {
        files: chunks.js.length,
        size: chunks.js.reduce((sum, f) => sum + f.size, 0),
        largest: chunks.js.slice(0, 5)
      },
      css: {
        files: chunks.css.length,
        size: chunks.css.reduce((sum, f) => sum + f.size, 0),
        largest: chunks.css.slice(0, 3)
      },
      assets: {
        files: chunks.assets.length,
        size: chunks.assets.reduce((sum, f) => sum + f.size, 0),
        largest: chunks.assets.slice(0, 5)
      }
    }
  }
  
  return analysis
}

// Generate recommendations
function generateRecommendations(analysis) {
  console.log('💡 Generating recommendations...')
  
  const recommendations = []
  
  // Check total bundle size
  if (analysis.total.size > config.thresholds.totalSize) {
    recommendations.push({
      type: 'warning',
      message: `Total bundle size (${formatBytes(analysis.total.size)}) exceeds recommended threshold (${formatBytes(config.thresholds.totalSize)})`,
      suggestions: [
        'Consider code splitting for large components',
        'Implement lazy loading for routes',
        'Optimize images and assets',
        'Review and remove unused dependencies'
      ]
    })
  }
  
  // Check JavaScript chunks
  analysis.chunks.js.largest.forEach(chunk => {
    if (chunk.size > config.thresholds.chunkSize) {
      recommendations.push({
        type: 'warning',
        message: `Large JS chunk detected: ${chunk.path} (${chunk.formattedSize})`,
        suggestions: [
          'Split this chunk into smaller modules',
          'Consider dynamic imports for heavy components',
          'Review dependencies in this chunk'
        ]
      })
    }
  })
  
  // Check vendor bundle
  const vendorChunk = analysis.chunks.js.largest.find(chunk => 
    chunk.path.includes('vendor') || chunk.path.includes('chunk')
  )
  
  if (vendorChunk && vendorChunk.size > config.thresholds.vendorSize) {
    recommendations.push({
      type: 'warning',
      message: `Large vendor bundle detected: ${vendorChunk.path} (${vendorChunk.formattedSize})`,
      suggestions: [
        'Review and remove unused dependencies',
        'Consider using tree-shaking',
        'Split vendor bundle into smaller chunks',
        'Use dynamic imports for heavy libraries'
      ]
    })
  }
  
  // Check for duplicate dependencies
  const duplicateCheck = analysis.chunks.js.largest.filter(chunk => 
    chunk.path.includes('node_modules')
  )
  
  if (duplicateCheck.length > 3) {
    recommendations.push({
      type: 'info',
      message: 'Multiple vendor chunks detected',
      suggestions: [
        'Consider bundling vendor dependencies into a single chunk',
        'Review webpack/vite configuration for optimal chunking'
      ]
    })
  }
  
  return recommendations
}

// Generate HTML report
function generateHTMLReport(files, analysis, recommendations) {
  console.log('📄 Generating HTML report...')
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bundle Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: #2563eb; color: white; padding: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .stat-card h3 { margin: 0 0 10px 0; color: #1e293b; }
        .stat-card .value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .files-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .files-table th, .files-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .files-table th { background: #f8fafc; font-weight: 600; }
        .recommendations { margin-top: 30px; }
        .recommendation { padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid; }
        .recommendation.warning { background: #fef3c7; border-color: #f59e0b; }
        .recommendation.info { background: #dbeafe; border-color: #3b82f6; }
        .recommendation h4 { margin: 0 0 10px 0; }
        .recommendation ul { margin: 10px 0; padding-left: 20px; }
        .recommendation li { margin-bottom: 5px; }
        .type-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .type-js { background: #fef3c7; color: #92400e; }
        .type-css { background: #dbeafe; color: #1e40af; }
        .type-asset { background: #dcfce7; color: #166534; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Bundle Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <h3>Total Files</h3>
                    <div class="value">${analysis.total.files}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Size</h3>
                    <div class="value">${formatBytes(analysis.total.size)}</div>
                </div>
                <div class="stat-card">
                    <h3>JavaScript</h3>
                    <div class="value">${formatBytes(analysis.chunks.js.size)}</div>
                    <small>${analysis.chunks.js.files} files</small>
                </div>
                <div class="stat-card">
                    <h3>CSS</h3>
                    <div class="value">${formatBytes(analysis.chunks.css.size)}</div>
                    <small>${analysis.chunks.css.files} files</small>
                </div>
                <div class="stat-card">
                    <h3>Assets</h3>
                    <div class="value">${formatBytes(analysis.chunks.assets.size)}</div>
                    <small>${analysis.chunks.assets.files} files</small>
                </div>
            </div>
            
            <h2>📋 File Breakdown</h2>
            <table class="files-table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Type</th>
                        <th>Size</th>
                    </tr>
                </thead>
                <tbody>
                    ${files.slice(0, 20).map(file => `
                        <tr>
                            <td>${file.path}</td>
                            <td><span class="type-badge type-${file.type}">${file.type}</span></td>
                            <td>${file.formattedSize}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="recommendations">
                <h2>💡 Recommendations</h2>
                ${recommendations.map(rec => `
                    <div class="recommendation ${rec.type}">
                        <h4>${rec.message}</h4>
                        <ul>
                            ${rec.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>
  `
  
  const reportPath = path.join(config.reportDir, 'bundle-analysis.html')
  fs.writeFileSync(reportPath, html)
  
  console.log(`✅ HTML report generated: ${reportPath}`)
  return reportPath
}

// Main analysis function
function runAnalysis() {
  try {
    console.log('🚀 Starting bundle analysis...\n')
    
    // Check if build directory exists
    if (!fs.existsSync(config.buildDir)) {
      console.log('📦 Building project first...')
      execSync('npm run build', { stdio: 'inherit' })
    }
    
    // Analyze bundle
    const files = analyzeBundle()
    const analysis = analyzeChunks(files)
    const recommendations = generateRecommendations(analysis)
    
    // Generate report
    const reportPath = generateHTMLReport(files, analysis, recommendations)
    
    // Print summary
    console.log('\n📊 Analysis Summary:')
    console.log(`Total files: ${analysis.total.files}`)
    console.log(`Total size: ${formatBytes(analysis.total.size)}`)
    console.log(`JavaScript: ${formatBytes(analysis.chunks.js.size)} (${analysis.chunks.js.files} files)`)
    console.log(`CSS: ${formatBytes(analysis.chunks.css.size)} (${analysis.chunks.css.files} files)`)
    console.log(`Assets: ${formatBytes(analysis.chunks.assets.size)} (${analysis.chunks.assets.files} files)`)
    
    console.log(`\n💡 Recommendations: ${recommendations.length}`)
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.message}`)
    })
    
    console.log(`\n📄 Full report: ${reportPath}`)
    
    // Check for warnings
    const warnings = recommendations.filter(r => r.type === 'warning')
    if (warnings.length > 0) {
      console.log(`\n⚠️  ${warnings.length} warnings found. Please review the recommendations above.`)
      process.exit(1)
    } else {
      console.log('\n✅ Bundle analysis completed successfully!')
    }
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message)
    process.exit(1)
  }
}

// Run analysis if this script is executed directly
if (require.main === module) {
  runAnalysis()
}

module.exports = {
  runAnalysis,
  analyzeBundle,
  analyzeChunks,
  generateRecommendations
}
