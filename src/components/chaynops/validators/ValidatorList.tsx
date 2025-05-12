// src/components/chaynops/validators/ValidatorList.tsx
'use client'

import { ValidatorCard } from './ValidatorCard'
import { ValidatorCardSkeleton } from './ValidatorCardSkeleton'

export function ValidatorList({ 
  validators,
  loading 
}: { 
  validators: string[]
  loading: boolean 
}) {
  if (loading) return <ValidatorCardSkeleton />
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {validators.map(address => (
        <ValidatorCard key={address} address={address} />
      ))}
    </div>
  )
}
