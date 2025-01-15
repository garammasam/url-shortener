import { Telegraf, Markup } from 'telegraf'
import dotenv from 'dotenv'
import { UrlService } from './services/urlService'

dotenv.config()

const bot = new Telegraf(process.env.BOT_TOKEN!)
const urlService = new UrlService()

// Start command
bot.command('start', (ctx) => {
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
  ctx.reply('Please send me the URL you want to shorten 🔗')
})

// Handle URLs for shortening
bot.on('text', async (ctx) => {
  const text = ctx.message.text

  // Ignore commands
  if (text.startsWith('/')) return

  // Check if text is a valid URL
  try {
    new URL(text)
    const shortUrl = await urlService.shortenUrl(text)
    ctx.reply(
      `✅ URL shortened successfully!\n\n` +
      `Original: ${text}\n` +
      `Shortened: ${shortUrl}\n\n` +
      `Use /analytics to track clicks`
    )
  } catch (error) {
    if (error instanceof TypeError) {
      ctx.reply('❌ Please send a valid URL (e.g., https://example.com)')
    } else {
      console.error('Error in URL shortening:', error)
      ctx.reply('Sorry, there was an error shortening your URL.')
    }
  }
})

// Analytics command
bot.command('analytics', async (ctx) => {
  console.log('Analytics command received')
  try {
    await ctx.reply('📊 Fetching analytics...')
    const allUrls = await urlService.getAllUrls()
    console.log('Fetched URLs:', allUrls)
    
    if (!allUrls || allUrls.length === 0) {
      return ctx.reply('No shortened URLs found. Use /shorten to create one!')
    }

    // Split URLs into chunks to avoid message length limits
    const urlChunks = []
    let currentChunk = ''
    
    for (const url of allUrls) {
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

    // Send each chunk as a separate message
    for (const chunk of urlChunks) {
      await ctx.reply(chunk, { parse_mode: 'Markdown' })
    }

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
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM')) 