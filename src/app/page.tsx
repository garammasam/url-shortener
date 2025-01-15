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
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">URL Shortener</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Shorten your URLs and track their performance
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label htmlFor="url" className="sr-only">
              URL to shorten
            </label>
            <input
              {...register('url')}
              type="url"
              id="url"
              placeholder="Enter your URL here"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isSubmitting}
            />
            {errors.url && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.url.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
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

        {shortUrl && (
          <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              Your shortened URL:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={() => handleCopy(shortUrl)}
                variant="outline"
                className="shrink-0"
              >
                Copy
              </Button>
            </div>
            <div className="mt-4">
              <Button
                variant="link"
                onClick={() => window.open(`/stats/${shortUrl.split('/').pop()}`, '_blank')}
                className="text-sm"
              >
                View Statistics →
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
