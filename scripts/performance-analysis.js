#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle size, Core Web Vitals, and generates optimization report
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Starting Performance Analysis...\n')

// =====================================================
// BUNDLE SIZE ANALYSIS
// =====================================================

function analyzeBundleSize() {
  console.log('📦 Analyzing Bundle Size...')
  
  try {
    // Build the application
    execSync('npm run build', { stdio: 'inherit' })
    
    // Analyze bundle with webpack-bundle-analyzer
    process.env.ANALYZE = 'true'
    execSync('npm run build', { stdio: 'inherit' })
    
    console.log('✅ Bundle analysis complete. Check the opened browser tab.\n')
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message)
  }
}

// =====================================================
// LIGHTHOUSE ANALYSIS
// =====================================================

function runLighthouseAnalysis() {
  console.log('💡 Running Lighthouse Analysis...')
  
  const urls = [
    'http://localhost:3001', // Landing page
    'http://localhost:3001/login', // Login page
    'http://localhost:3001/dashboard', // Dashboard
    'http://localhost:3001/projects', // Projects page
    'http://localhost:3001/gallery', // Gallery page
  ]
  
  urls.forEach(url => {
    try {
      console.log(`Analyzing: ${url}`)
      
      // Run Lighthouse CLI (requires lighthouse package)
      const command = `npx lighthouse ${url} --output=json --output-path=./lighthouse-${url.split('/').pop() || 'home'}.json --chrome-flags="--headless"`
      execSync(command, { stdio: 'inherit' })
      
    } catch (error) {
      console.log(`⚠️  Could not analyze ${url}: ${error.message}`)
    }
  })
  
  console.log('✅ Lighthouse analysis complete.\n')
}

// =====================================================
// PERFORMANCE RECOMMENDATIONS
// =====================================================

function generateRecommendations() {
  console.log('💡 Performance Optimization Recommendations:\n')
  
  const recommendations = [
    {
      category: '🖼️ Image Optimization',
      items: [
        'Use OptimizedImage component for all images',
        'Implement lazy loading for gallery images',
        'Use WebP/AVIF formats via Cloudinary',
        'Generate responsive srcsets for different screen sizes',
        'Preload critical above-the-fold images'
      ]
    },
    {
      category: '📦 Bundle Optimization',
      items: [
        'Implement dynamic imports for heavy components',
        'Use React.lazy() for non-critical components',
        'Tree-shake unused dependencies',
        'Split vendor bundles from application code',
        'Use Next.js built-in code splitting'
      ]
    },
    {
      category: '⚡ Runtime Performance',
      items: [
        'Implement caching strategy for API responses',
        'Use React.memo() for expensive components',
        'Optimize re-renders with useMemo/useCallback',
        'Implement virtual scrolling for large lists',
        'Use Intersection Observer for lazy loading'
      ]
    },
    {
      category: '🌐 Network Optimization',
      items: [
        'Enable compression (gzip/brotli)',
        'Implement service worker for caching',
        'Use CDN for static assets',
        'Optimize API response sizes',
        'Implement request deduplication'
      ]
    },
    {
      category: '📊 Core Web Vitals',
      items: [
        'LCP: Optimize largest contentful paint < 2.5s',
        'INP: Ensure interactions respond < 200ms',
        'CLS: Minimize cumulative layout shift < 0.1',
        'FCP: First contentful paint < 1.8s',
        'TTFB: Time to first byte < 800ms'
      ]
    }
  ]
  
  recommendations.forEach(({ category, items }) => {
    console.log(category)
    items.forEach(item => console.log(`  • ${item}`))
    console.log('')
  })
}

// =====================================================
// PERFORMANCE BUDGET
// =====================================================

function checkPerformanceBudget() {
  console.log('💰 Performance Budget Check:\n')
  
  const budget = {
    'JavaScript Bundle': '250 KB (gzipped)',
    'CSS Bundle': '50 KB (gzipped)',
    'Images (Critical)': '500 KB',
    'Total Page Weight': '1.5 MB',
    'First Load JS': '200 KB',
    'LCP': '< 2.5s',
    'INP': '< 200ms',
    'CLS': '< 0.1'
  }
  
  Object.entries(budget).forEach(([metric, target]) => {
    console.log(`📊 ${metric}: ${target}`)
  })
  
  console.log('\n⚠️  Monitor these metrics in production!')
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--bundle') || args.includes('--all')) {
    analyzeBundleSize()
  }
  
  if (args.includes('--lighthouse') || args.includes('--all')) {
    runLighthouseAnalysis()
  }
  
  if (args.includes('--recommendations') || args.includes('--all')) {
    generateRecommendations()
  }
  
  if (args.includes('--budget') || args.includes('--all')) {
    checkPerformanceBudget()
  }
  
  if (args.length === 0) {
    console.log('Usage:')
    console.log('  npm run perf:analyze --bundle       # Analyze bundle size')
    console.log('  npm run perf:analyze --lighthouse   # Run Lighthouse tests')
    console.log('  npm run perf:analyze --recommendations # Show optimization tips')
    console.log('  npm run perf:analyze --budget       # Check performance budget')
    console.log('  npm run perf:analyze --all          # Run all analyses')
  }
}

main().catch(console.error)

