// src/components/chaynops/validators/Tooltip.tsx
'use client'

import { useState } from 'react'

export function Tooltip({ 
  content, 
  children 
}: { 
  content: string 
  children: React.ReactNode 
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className="absolute z-10 p-2 mt-1 text-xs bg-gray-800 text-white rounded shadow-lg">
          {content}
        </div>
      )}
    </div>
  )
}
