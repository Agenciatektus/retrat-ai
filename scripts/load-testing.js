#!/usr/bin/env node

/**
 * Load Testing Script
 * Tests application performance under load
 */

const https = require('https')
const http = require('http')

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001'
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS) || 10
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 60 // seconds
const RAMP_UP_TIME = parseInt(process.env.RAMP_UP_TIME) || 10 // seconds

console.log('🔥 Starting Load Testing...')
console.log(`📊 Configuration:`)
console.log(`   URL: ${BASE_URL}`)
console.log(`   Concurrent Users: ${CONCURRENT_USERS}`)
console.log(`   Duration: ${TEST_DURATION}s`)
console.log(`   Ramp-up: ${RAMP_UP_TIME}s\n`)

// Test scenarios
const scenarios = [
  {
    name: 'Landing Page',
    path: '/',
    weight: 40 // 40% of traffic
  },
  {
    name: 'Login Page',
    path: '/login',
    weight: 20 // 20% of traffic
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    weight: 15 // 15% of traffic
  },
  {
    name: 'Projects Page',
    path: '/projects',
    weight: 15 // 15% of traffic
  },
  {
    name: 'Gallery Page',
    path: '/gallery',
    weight: 10 // 10% of traffic
  }
]

// Results tracking
let results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: {},
  startTime: Date.now()
}

/**
 * Make HTTP request
 */
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const url = new URL(path, BASE_URL)
    
    const requestModule = url.protocol === 'https:' ? https : http
    
    const req = requestModule.get(url, (res) => {
      let data = ''
      
      res.on('data', chunk => {
        data += chunk
      })
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime
        results.totalRequests++
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          results.successfulRequests++
          results.responseTimes.push(responseTime)
        } else {
          results.failedRequests++
          const errorKey = `${res.statusCode}`
          results.errors[errorKey] = (results.errors[errorKey] || 0) + 1
        }
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          contentLength: data.length
        })
      })
    })
    
    req.on('error', (error) => {
      results.totalRequests++
      results.failedRequests++
      results.errors['NETWORK_ERROR'] = (results.errors['NETWORK_ERROR'] || 0) + 1
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      results.totalRequests++
      results.failedRequests++
      results.errors['TIMEOUT'] = (results.errors['TIMEOUT'] || 0) + 1
      reject(new Error('Request timeout'))
    })
  })
}

/**
 * Simulate user behavior
 */
async function simulateUser(userId) {
  const userStartTime = Date.now()
  let userRequests = 0
  
  while (Date.now() - userStartTime < TEST_DURATION * 1000) {
    // Pick random scenario based on weight
    const random = Math.random() * 100
    let cumulativeWeight = 0
    let selectedScenario = scenarios[0]
    
    for (const scenario of scenarios) {
      cumulativeWeight += scenario.weight
      if (random <= cumulativeWeight) {
        selectedScenario = scenario
        break
      }
    }
    
    try {
      await makeRequest(selectedScenario.path)
      userRequests++
      
      // Wait between requests (simulate user think time)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
    } catch (error) {
      // Continue testing even if request fails
    }
  }
  
  console.log(`👤 User ${userId} completed ${userRequests} requests`)
}

/**
 * Generate performance report
 */
function generateReport() {
  const duration = (Date.now() - results.startTime) / 1000
  const avgResponseTime = results.responseTimes.length > 0 
    ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
    : 0
  
  const p95ResponseTime = results.responseTimes.length > 0
    ? results.responseTimes.sort((a, b) => a - b)[Math.floor(results.responseTimes.length * 0.95)]
    : 0
  
  const successRate = results.totalRequests > 0 
    ? (results.successfulRequests / results.totalRequests) * 100 
    : 0
  
  const requestsPerSecond = results.totalRequests / duration

  console.log('\n📊 Load Testing Results:')
  console.log('=' .repeat(50))
  console.log(`Duration: ${duration.toFixed(1)}s`)
  console.log(`Total Requests: ${results.totalRequests}`)
  console.log(`Successful: ${results.successfulRequests}`)
  console.log(`Failed: ${results.failedRequests}`)
  console.log(`Success Rate: ${successRate.toFixed(2)}%`)
  console.log(`Requests/sec: ${requestsPerSecond.toFixed(2)}`)
  console.log(`Avg Response Time: ${avgResponseTime.toFixed(0)}ms`)
  console.log(`95th Percentile: ${p95ResponseTime.toFixed(0)}ms`)
  
  if (Object.keys(results.errors).length > 0) {
    console.log('\n❌ Errors:')
    Object.entries(results.errors).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`)
    })
  }
  
  console.log('\n🎯 Performance Assessment:')
  console.log(`   Success Rate: ${successRate >= 99 ? '✅' : '❌'} ${successRate.toFixed(2)}% (target: ≥99%)`)
  console.log(`   Avg Response: ${avgResponseTime <= 500 ? '✅' : '❌'} ${avgResponseTime.toFixed(0)}ms (target: ≤500ms)`)
  console.log(`   95th Percentile: ${p95ResponseTime <= 1000 ? '✅' : '❌'} ${p95ResponseTime.toFixed(0)}ms (target: ≤1000ms)`)
  console.log(`   Throughput: ${requestsPerSecond >= 10 ? '✅' : '❌'} ${requestsPerSecond.toFixed(2)} req/s (target: ≥10 req/s)`)
}

/**
 * Main load testing function
 */
async function runLoadTest() {
  console.log('🚀 Starting load test...\n')
  
  // Create array of user simulation promises
  const userPromises = []
  
  // Ramp up users gradually
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    setTimeout(() => {
      userPromises.push(simulateUser(i + 1))
    }, (i * RAMP_UP_TIME * 1000) / CONCURRENT_USERS)
  }
  
  // Wait for all users to complete
  await Promise.all(userPromises)
  
  // Generate report
  generateReport()
}

// Run the load test
runLoadTest().catch(console.error)
