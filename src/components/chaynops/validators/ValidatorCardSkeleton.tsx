// src/components/chaynops/validators/ValidatorCardSkeleton.tsx
'use client'

export function ValidatorCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  )
}
