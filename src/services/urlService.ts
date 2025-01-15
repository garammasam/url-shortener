import { nanoid } from 'nanoid'
import { supabase } from '../lib/supabase'

export class UrlService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  }

  async shortenUrl(originalUrl: string): Promise<string> {
    try {
      // Generate short code
      const shortCode = nanoid(8)
      
      // Store in database
      const { data, error } = await supabase
        .from('urls')
        .insert({
          original_url: originalUrl,
          short_code: shortCode,
          clicks: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Failed to create shortened URL: ${error.message}`)
      }

      return `${this.baseUrl}/${shortCode}`
    } catch (error) {
      console.error('Error in shortenUrl:', error)
      throw error
    }
  }

  async getAllUrls() {
    console.log('Fetching all URLs...')
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error in getAllUrls:', error)
        throw new Error(`Failed to fetch URLs: ${error.message}`)
      }

      console.log(`Found ${data?.length || 0} URLs`)
      return data || []
    } catch (error) {
      console.error('Error in getAllUrls:', error)
      throw error
    }
  }

  async getUrlAnalytics(shortCode: string) {
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (error) throw new Error('Failed to get URL analytics')
    return data
  }

  async trackClick(shortCode: string) {
    try {
      const { error } = await supabase.rpc('increment_url_clicks', { short_code_param: shortCode })
      if (error) throw error
    } catch (error) {
      console.error('Error tracking click:', error)
      throw new Error('Failed to track click')
    }
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('original_url')
        .eq('short_code', shortCode)
        .single()

      if (error || !data) throw new Error('URL not found')
      
      // Track the click asynchronously
      this.trackClick(shortCode).catch(console.error)
      
      return data.original_url
    } catch (error) {
      console.error('Error getting original URL:', error)
      throw error
    }
  }
} 