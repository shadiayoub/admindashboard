// src/components/chaynops/validators/ValidatorCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { ValidatorCardSkeleton } from './ValidatorCardSkeleton'
import { ValidatorCardError } from './ValidatorCardError'
import { Tooltip } from './Tooltip'
import { StatusBadge } from './StatusBadge'
import { HealthIndicator } from './HealthIndicator'

interface ValidatorData {
  address: string
  blocksSealed: number
  uptime: number
  status: 'active' | 'inactive' | 'needs_attention'
  consecutiveMissed: number
}

export function ValidatorCard({ address }: { address: string }) {
  const [data, setData] = useState<ValidatorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/validators/${address}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to fetch validator')
        }
        setData(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [address])

  if (loading) return <ValidatorCardSkeleton />
  if (error) return <ValidatorCardError address={address} error={error} />

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-mono text-sm truncate max-w-[180px]" title={address}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </h3>
          {data?.lastSealedBlock !== 'Not available' && (
            <p className="text-xs text-gray-500 mt-1">
              Last block: #{data.lastSealedBlock}
            </p>
          )}
        </div>
        <StatusBadge status={data?.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <p className="text-xs text-gray-500">Uptime</p>
          <p className="font-medium">{data?.uptime ? `${data.uptime.toFixed(1)}%` : '--'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Health</p>
          <HealthIndicator 
            score={data ? Math.round(data.uptime) : 0} 
            missed={data?.consecutiveMissed || 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <p className="text-xs text-gray-500">Blocks Sealed</p>
          <p className="font-medium">{data?.blocksSealed || '--'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Consecutive Missed</p>
          <p className={`font-medium ${
            (data?.consecutiveMissed || 0) > 5 ? 'text-yellow-600' : ''
          }`}>
            {data?.consecutiveMissed || '--'}
          </p>
        </div>
      </div>
    </div>
  )
}

// Enhanced MetricItem component
function MetricItem({ 
  label, 
  value, 
  suffix = '',
  warning = false,
  tooltip 
}: {
  label: string
  value: string | number | undefined
  suffix?: string
  warning?: boolean
  tooltip?: string
}) {
  return (
    <Tooltip content={tooltip}>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium ${warning ? 'text-yellow-600' : ''}`}>
          {value ?? '--'}
          {suffix}
        </p>
      </div>
    </Tooltip>
  )
}