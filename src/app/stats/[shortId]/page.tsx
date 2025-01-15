'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface Click {
  id: string
  createdAt: string
  ipAddress: string | null
  userAgent: string | null
  referer: string | null
}

interface ShortUrl {
  id: string
  url: string
  shortId: string
  clicks: Click[]
}

export default function StatsPage() {
  const params = useParams()
  const [stats, setStats] = useState<ShortUrl | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats/${params.shortId}`)
        const data = await response.json()

        if (response.ok) {
          setStats(data)
        } else {
          toast.error(data.error || 'Failed to fetch statistics')
        }
      } catch (error) {
        toast.error('Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [params.shortId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="h-8 w-8" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <p className="text-xl font-medium text-red-600 dark:text-red-400">
            URL not found
          </p>
          <Button onClick={() => window.location.href = '/'} size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
              URL Statistics
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Detailed analytics for your shortened URL
            </p>
          </div>
          
          <div className="mt-8 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">URL Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Original URL:</span>{' '}
                <a href={stats.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                  {stats.url}
                </a>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Short URL:</span>{' '}
                <a href={`/${stats.shortId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {`${window.location.origin}/${stats.shortId}`}
                </a>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks:</span>{' '}
                <span className="text-gray-900 dark:text-gray-50 font-medium">{stats.clicks.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-6">Click History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">User Agent</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Referer</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.clicks.map((click) => (
                    <tr key={click.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(click.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {click.ipAddress || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {click.userAgent || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {click.referer || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 