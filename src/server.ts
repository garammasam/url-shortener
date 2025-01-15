import express from 'express'
import dotenv from 'dotenv'
import { UrlService } from './services/urlService'
import https from 'https'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const urlService = new UrlService()

// Ping endpoint
app.get('/ping', (req, res) => {
  console.log('Ping received at:', new Date().toISOString())
  res.send('pong')
})

// Redirect endpoint
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params
    const originalUrl = await urlService.getOriginalUrl(shortCode)
    res.redirect(originalUrl)
  } catch (error) {
    res.status(404).send('URL not found')
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK')
})

// Auto-ping function to keep the service alive
function pingService() {
  const serviceUrl = process.env.BASE_URL || `http://localhost:${port}`
  
  // Don't ping if we're running locally
  if (serviceUrl.includes('localhost')) {
    return
  }

  setInterval(() => {
    https.get(`${serviceUrl}/ping`, (resp) => {
      console.log('Auto-ping sent at:', new Date().toISOString())
    }).on('error', (err) => {
      console.error('Error pinging service:', err.message)
    })
  }, 14 * 60 * 1000) // Ping every 14 minutes (Render sleeps after 15 minutes of inactivity)
}

app.listen(port, () => {
  console.log(`URL shortener service listening on port ${port}`)
  pingService() // Start the auto-ping when server starts
}) 