// src/components/chaynops/validators/ValidatorDashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { NetworkStatus } from './NetworkStatus'
import { ValidatorList } from './ValidatorList'
import { RefreshButton } from '@/components/common/RefreshButton'

export function ValidatorsDashboard() {
  const [validators, setValidators] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchValidators = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/validators/list')
      const data = await res.json()
      setValidators(data.validators)
      setLastUpdated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh
  useEffect(() => {
    fetchValidators()
    const interval = setInterval(fetchValidators, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [refreshTrigger])

  // Manual refresh handler
  const handleRefresh = async () => {
    await fetchValidators()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Validator Network</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <RefreshButton onClick={handleRefresh} />
        </div>
      </div>

      <NetworkStatus />
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Validators</h2>
        <ValidatorList validators={validators} loading={loading} />
      </div>
    </div>
  )
}
