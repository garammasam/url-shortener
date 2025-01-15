import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
import { UrlService } from './services/urlService'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN!)
const urlService = new UrlService()

// Start command
bot.command('start', (ctx) => {
  ctx.reply(
    'Welcome to URL Shortener Bot! 🔗\n\n' +
    'Commands:\n' +
    '/shorten <url> - Shorten a URL\n' +
    '/analytics <short_code> - Get analytics for a shortened URL'
  )
})

// Shorten URL command
bot.command('shorten', async (ctx) => {
  const url = ctx.message.text.split(' ')[1]
  if (!url) {
    return ctx.reply('Please provide a URL to shorten.\nExample: /shorten https://example.com')
  }

  try {
    const shortUrl = await urlService.shortenUrl(url)
    ctx.reply(`Here's your shortened URL: ${shortUrl}`)
  } catch (error) {
    console.error('Error in shorten command:', error)
    ctx.reply(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
  }
})

// Get analytics command
bot.command('analytics', async (ctx) => {
  const shortCode = ctx.message.text.split(' ')[1]
  if (!shortCode) {
    return ctx.reply('Please provide a short code.\nExample: /analytics abc123')
  }

  try {
    const analytics = await urlService.getUrlAnalytics(shortCode)
    ctx.reply(
      `📊 Analytics for ${shortCode}:\n\n` +
      `Original URL: ${analytics.original_url}\n` +
      `Total Clicks: ${analytics.clicks}\n` +
      `Created: ${new Date(analytics.created_at).toLocaleDateString()}\n` +
      `Last Accessed: ${analytics.last_accessed ? new Date(analytics.last_accessed).toLocaleDateString() : 'Never'}`
    )
  } catch (error) {
    ctx.reply('Sorry, could not find analytics for this URL.')
  }
})

// Handle invalid commands
bot.on('text', (ctx) => {
  ctx.reply('Sorry, I don\'t understand that command. Use /start to see available commands.')
})

// Start the bot
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM')) 