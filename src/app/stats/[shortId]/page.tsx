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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mb-4" />
          <p className="text-lg">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400 mb-4">
            URL not found
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">URL Statistics</h1>
        
        <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">URL Details</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Original URL:</span>{' '}
              <a href={stats.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {stats.url}
              </a>
            </p>
            <p>
              <span className="font-medium">Short URL:</span>{' '}
              <a href={`/${stats.shortId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                {`${window.location.origin}/${stats.shortId}`}
              </a>
            </p>
            <p>
              <span className="font-medium">Total Clicks:</span>{' '}
              {stats.clicks.length}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Click History</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b dark:border-gray-700 text-left">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2">User Agent</th>
                  <th className="pb-2">Referer</th>
                </tr>
              </thead>
              <tbody>
                {stats.clicks.map((click) => (
                  <tr key={click.id} className="border-b dark:border-gray-700">
                    <td className="py-2">
                      {new Date(click.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">{click.ipAddress || 'N/A'}</td>
                    <td className="py-2 max-w-xs truncate">
                      {click.userAgent || 'N/A'}
                    </td>
                    <td className="py-2">{click.referer || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
} 