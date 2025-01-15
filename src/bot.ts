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
  try {
    const allUrls = await urlService.getAllUrls()
    
    if (allUrls.length === 0) {
      return ctx.reply('No shortened URLs found. Use /shorten to create one!')
    }

    let message = '📊 *URL Analytics*\n\n'
    for (const url of allUrls) {
      const shortUrl = `${process.env.BASE_URL}/${url.short_code}`
      message += `*Short URL:* ${shortUrl}\n`
      message += `*Original:* ${url.original_url}\n`
      message += `*Clicks:* ${url.clicks}\n`
      message += `*Created:* ${new Date(url.created_at).toLocaleDateString()}\n`
      if (url.last_accessed) {
        message += `*Last Click:* ${new Date(url.last_accessed).toLocaleDateString()}\n`
      }
      message += '\n'
    }

    ctx.replyWithMarkdown(message)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    ctx.reply('Sorry, could not fetch analytics at this time.')
  }
})

// Start the bot
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM')) 