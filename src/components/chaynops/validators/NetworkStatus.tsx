// components/NetworkStatus.tsx
'use client'

import { useState, useEffect } from 'react'
import { Tooltip } from './Tooltip'

export function NetworkStatus() {
  const [data, setData] = useState<{
    peerCount: number
    participationRate: string
    lastBlockNumber: number
    updatedAt: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const handleRefresh = async () => {
  const res = await fetch('/api/validators/network')
    setData(await res.json())
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/validators/network')
        setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const [active, total] = data?.participationRate.split('/').map(Number) || [0, 1]
  const participationPercent = Math.round((active / total) * 100)

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Network Health</h2>
        {data?.updatedAt && (
          <span className="text-xs text-gray-500">
            Updated: {new Date(data.updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peer Connectivity */}
        <div className="border rounded p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Peers + 1 (your node)</h3>
            <div className={`w-3 h-3 rounded-full ${
              (data?.peerCount || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          <p className="text-2xl font-bold mt-1">{data?.peerCount || 0}</p>
        </div>

        {/* Participation */}
        <div className="border rounded p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Participation</h3>
            <Tooltip content={`${active} of ${total} validators active`}>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {participationPercent}%
              </span>
            </Tooltip>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${participationPercent}%` }}
            />
          </div>
        </div>

        {/* Latest Block */}
        <div className="border rounded p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Latest Block</h3>
            <Tooltip content="Block number from chain head">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>
          <p className="text-2xl font-bold mt-1">#{data?.lastBlockNumber?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </div>
  )
}
