import { nanoid } from 'nanoid'
import { supabase } from '../lib/supabase'

export class UrlService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    console.log('UrlService initialized with baseUrl:', this.baseUrl)
  }

  async shortenUrl(originalUrl: string): Promise<string> {
    console.log('Shortening URL:', originalUrl)
    try {
      // Generate short code
      const shortCode = nanoid(8)
      console.log('Generated shortCode:', shortCode)
      
      // Store in database
      console.log('Inserting into Supabase...')
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
        console.error('Supabase error in shortenUrl:', error)
        throw new Error(`Failed to create shortened URL: ${error.message}`)
      }

      console.log('Successfully inserted:', data)
      const finalUrl = `${this.baseUrl}/${shortCode}`
      console.log('Returning shortened URL:', finalUrl)
      return finalUrl
    } catch (error) {
      console.error('Error in shortenUrl:', error)
      throw error
    }
  }

  async getAllUrls() {
    console.log('getAllUrls: Starting fetch...')
    try {
      console.log('Querying Supabase for all URLs...')
      const { data, error } = await supabase
        .from('urls')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error in getAllUrls:', error)
        throw new Error(`Failed to fetch URLs: ${error.message}`)
      }

      console.log('getAllUrls: Raw response:', { data, error })
      console.log(`getAllUrls: Found ${data?.length || 0} URLs`)
      
      if (data && data.length > 0) {
        console.log('First URL in results:', data[0])
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUrls:', error)
      throw error
    }
  }

  async getUrlAnalytics(shortCode: string) {
    console.log('Getting analytics for shortCode:', shortCode)
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (error) {
      console.error('Error in getUrlAnalytics:', error)
      throw new Error('Failed to get URL analytics')
    }
    console.log('Analytics data:', data)
    return data
  }

  async trackClick(shortCode: string) {
    console.log('Tracking click for shortCode:', shortCode)
    try {
      const { error } = await supabase.rpc('increment_url_clicks', { short_code_param: shortCode })
      if (error) {
        console.error('Error in trackClick RPC:', error)
        throw error
      }
      console.log('Successfully tracked click')
    } catch (error) {
      console.error('Error in trackClick:', error)
      throw new Error('Failed to track click')
    }
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    console.log('Getting original URL for shortCode:', shortCode)
    try {
      const { data, error } = await supabase
        .from('urls')
        .select('original_url')
        .eq('short_code', shortCode)
        .single()

      if (error || !data) {
        console.error('Error or no data in getOriginalUrl:', { error, data })
        throw new Error('URL not found')
      }
      
      console.log('Found original URL:', data.original_url)
      
      // Track the click asynchronously
      this.trackClick(shortCode).catch(console.error)
      
      return data.original_url
    } catch (error) {
      console.error('Error in getOriginalUrl:', error)
      throw error
    }
  }
} 