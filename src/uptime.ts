import https from 'https'
import dotenv from 'dotenv'

dotenv.config()

const PING_INTERVAL = 14 * 60 * 1000 // 14 minutes
const serviceUrl = process.env.BASE_URL

if (!serviceUrl || serviceUrl.includes('localhost')) {
  console.log('Skipping uptime monitor for localhost')
  process.exit(0)
}

console.log('Starting uptime monitor for:', serviceUrl)

setInterval(() => {
  https.get(`${serviceUrl}/ping`, (resp) => {
    console.log('External ping sent at:', new Date().toISOString())
  }).on('error', (err) => {
    console.error('Error in external ping:', err.message)
  })
}, PING_INTERVAL)

// Keep the script running
process.stdin.resume() 