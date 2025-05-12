// src/components/common/RefreshButton.tsx
'use client'

import { useState, useEffect } from 'react'

export function RefreshButton({ 
  onClick 
}: { 
  onClick: () => Promise<void> | void 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastClicked, setLastClicked] = useState<number | null>(null)

  const handleClick = async () => {
    setIsRefreshing(true)
    setLastClicked(Date.now())
    try {
      await onClick()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Visual cooldown effect
  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    if (!lastClicked) return
    
    const interval = setInterval(() => {
      const secondsElapsed = Math.floor((Date.now() - lastClicked) / 1000)
      setCooldown(Math.max(0, 5 - secondsElapsed)) // 5-second cooldown
    }, 200)

    return () => clearInterval(interval)
  }, [lastClicked])

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing || cooldown > 0}
      className={`relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
        isRefreshing 
          ? 'bg-gray-100 text-gray-500' 
          : cooldown > 0
            ? 'bg-gray-50 text-gray-400'
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
      aria-label="Refresh data"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${isRefreshing ? 'animate-spin' : ''}`}
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
      Refresh
      {cooldown > 0 && (
        <span className="absolute -right-2 -top-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
          {cooldown}s
        </span>
      )}
    </button>
  )
}
