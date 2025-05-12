// src/components/chaynops/validators/ValidatorCardError.tsx
'use client'

export function ValidatorCardError({ 
  address, 
  error 
}: { 
  address: string 
  error: string | null 
}) {
  return (
    <div className="border rounded-lg p-4 bg-red-50 text-red-800">
      <p className="font-medium">Failed to load validator</p>
      <p className="font-mono text-xs truncate mt-1">{address}</p>
      {error && <p className="text-xs mt-2">{error}</p>}
    </div>
  )
}
