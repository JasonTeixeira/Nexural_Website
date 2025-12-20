import { useState, useEffect } from 'react'

interface DiscordStats {
  memberCount: number
  onlineCount: number
  lastUpdated: string
  error?: string
}

interface UseDiscordStatsReturn {
  memberCount: number
  onlineCount: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to fetch and manage Discord server statistics
 * 
 * @param autoRefresh - Whether to automatically refresh stats every 5 minutes
 * @returns Discord stats with loading and error states
 * 
 * @example
 * const { memberCount, onlineCount, isLoading } = useDiscordStats(true)
 * 
 * return (
 *   <div>
 *     {isLoading ? 'Loading...' : `${memberCount.toLocaleString()} members`}
 *   </div>
 * )
 */
export function useDiscordStats(autoRefresh: boolean = true): UseDiscordStatsReturn {
  const [stats, setStats] = useState<DiscordStats>({
    memberCount: 0,
    onlineCount: 0,
    lastUpdated: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/discord/stats')
      const data: DiscordStats = await response.json()

      if (data.error) {
        setError(data.error)
        // Still set the data (will be 0s) for graceful degradation
        setStats(data)
      } else {
        setError(null)
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch Discord stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchStats()

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5 * 60 * 1000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return {
    memberCount: stats.memberCount,
    onlineCount: stats.onlineCount,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
