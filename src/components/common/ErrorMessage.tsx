// src/components/common/ErrorMessage.tsx
'use client'

export function ErrorMessage({ 
  title, 
  message, 
  onRetry 
}: { 
  title: string 
  message: string 
  onRetry?: () => void 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-red-800 font-medium">{title}</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
