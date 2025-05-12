// src/components/chaynops/validators/HealthIndicator.tsx
'use client'

export function HealthIndicator({ 
  score, 
  missed 
}: { 
  score: number 
  missed: number 
}) {
  const getHealthColor = () => {
    if (missed > 10) return 'bg-red-500'
    if (missed > 5) return 'bg-yellow-500'
    if (score > 90) return 'bg-green-500'
    if (score > 70) return 'bg-blue-500'
    return 'bg-gray-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getHealthColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium">{score}%</span>
    </div>
  )
}
