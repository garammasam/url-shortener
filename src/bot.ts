import { Telegraf, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { UrlService } from './services/urlService'

dotenv.config()

console.log('Starting bot with environment:', {
  BASE_URL: process.env.BASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'not set',
  BOT_TOKEN: process.env.BOT_TOKEN ? 'set' : 'not set'
})

const bot = new Telegraf(process.env.BOT_TOKEN!)
const urlService = new UrlService()

// Start command
bot.command('start', (ctx) => {
  console.log('Start command received from:', ctx.from?.id)
  const keyboard = Markup.keyboard([
    ['/shorten', '/analytics'],
  ]).resize()

  ctx.reply(
    'Welcome to URL Shortener Bot! 🔗\n\n' +
    'Choose a command:\n' +
    '• /shorten - Create a new short URL\n' +
    '• /analytics - View analytics for all URLs',
    keyboard
  )
})

// Shorten URL command
bot.command('shorten', async (ctx) => {
  console.log('Shorten command received from:', ctx.from?.id)
  ctx.reply('Please send me the URL you want to shorten 🔗')
})

// Handle URLs for shortening
bot.on('text', async (ctx) => {
  const text = ctx.message.text
  console.log('Received text message:', { userId: ctx.from?.id, text })

  // Ignore commands
  if (text.startsWith('/')) {
    console.log('Ignoring command message:', text)
    return
  }

  // Check if text is a valid URL
  try {
    console.log('Attempting to validate URL:', text)
    new URL(text)
    console.log('URL is valid, attempting to shorten')
    const shortUrl = await urlService.shortenUrl(text)
    console.log('URL shortened successfully:', shortUrl)
    ctx.reply(
      `✅ URL shortened successfully!\n\n` +
      `Original: ${text}\n` +
      `Shortened: ${shortUrl}\n\n` +
      `Use /analytics to track clicks`
    )
  } catch (error) {
    if (error instanceof TypeError) {
      console.log('Invalid URL received:', text)
      ctx.reply('❌ Please send a valid URL (e.g., https://example.com)')
    } else {
      console.error('Error in URL shortening:', error)
      ctx.reply('Sorry, there was an error shortening your URL.')
    }
  }
})

// Analytics command
bot.command('analytics', async (ctx) => {
  const userId = ctx.from?.id
  console.log('Analytics command received from:', userId)
  try {
    console.log('Sending initial analytics fetch message')
    await ctx.reply('📊 Fetching analytics...')
    
    console.log('Requesting URLs from service')
    const allUrls = await urlService.getAllUrls()
    console.log('Received URLs from service:', { count: allUrls?.length, urls: allUrls })
    
    if (!allUrls || allUrls.length === 0) {
      console.log('No URLs found for analytics')
      return ctx.reply('No shortened URLs found. Use /shorten to create one!')
    }

    // Split URLs into chunks to avoid message length limits
    const urlChunks = []
    let currentChunk = ''
    
    console.log('Processing URLs for display')
    for (const url of allUrls) {
      console.log('Processing URL:', { shortCode: url.short_code, clicks: url.clicks })
      const urlMessage = 
        `🔗 *Short URL:*\n` +
        `${process.env.BASE_URL}/${url.short_code}\n\n` +
        `📎 *Original:*\n` +
        `${url.original_url}\n\n` +
        `👆 *Clicks:* ${url.clicks}\n` +
        `📅 *Created:* ${new Date(url.created_at).toLocaleDateString()}\n` +
        (url.last_accessed ? `🕒 *Last Click:* ${new Date(url.last_accessed).toLocaleDateString()}\n` : '') +
        `\n---\n\n`

      // If adding this URL would exceed message limit, start new chunk
      if (currentChunk.length + urlMessage.length > 3500) {
        urlChunks.push(currentChunk)
        currentChunk = urlMessage
      } else {
        currentChunk += urlMessage
      }
    }
    
    // Add the last chunk
    if (currentChunk) {
      urlChunks.push(currentChunk)
    }

    console.log('Sending analytics messages:', { chunks: urlChunks.length })
    // Send each chunk as a separate message
    for (let i = 0; i < urlChunks.length; i++) {
      console.log(`Sending chunk ${i + 1}/${urlChunks.length}`)
      await ctx.reply(urlChunks[i], { parse_mode: 'Markdown' })
    }
    console.log('Finished sending analytics')

  } catch (error) {
    console.error('Error in analytics command:', error)
    ctx.reply(`Sorry, could not fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err)
  ctx.reply('An error occurred while processing your request.')
})

// Start the bot
console.log('Starting bot...')
bot.launch()
console.log('Bot started successfully')

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Received SIGINT, stopping bot...')
  bot.stop('SIGINT')
})
process.once('SIGTERM', () => {
  console.log('Received SIGTERM, stopping bot...')
  bot.stop('SIGTERM')
}) 