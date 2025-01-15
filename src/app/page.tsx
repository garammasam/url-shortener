'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
})

type FormData = z.infer<typeof urlSchema>

export default function Home() {
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(urlSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (response.ok) {
        const newShortUrl = `${window.location.origin}/${result.shortId}`
        setShortUrl(newShortUrl)
        reset()
        toast.success('URL shortened successfully!')
      } else {
        toast.error(result.error || 'Failed to shorten URL')
      }
    } catch (error) {
      toast.error('Failed to shorten URL')
      console.error('Error creating short URL:', error)
    }
  }

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
              URL Shortener
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Shorten your URLs and track their performance
            </p>
          </div>

          <div className="mt-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL to shorten
                </label>
                <input
                  {...register('url')}
                  type="url"
                  id="url"
                  placeholder="Enter your URL here"
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  disabled={isSubmitting}
                />
                {errors.url && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.url.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Shortening...
                  </>
                ) : (
                  'Shorten URL'
                )}
              </Button>
            </form>
          </div>

          {shortUrl && (
            <div className="mt-8 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-6 shadow-sm">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Your shortened URL:
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={shortUrl}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  onClick={() => handleCopy(shortUrl)}
                  variant="outline"
                  className="shrink-0 h-10"
                >
                  Copy
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  variant="link"
                  onClick={() => window.open(`/stats/${shortUrl.split('/').pop()}`, '_blank')}
                  className="text-sm px-0 h-auto font-medium"
                >
                  View Statistics →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
