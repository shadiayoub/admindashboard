// src/components/chaynops/validators/StatusBadge.tsx
'use client'

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const statusMap = {
    active: {
      text: 'Active',
      class: 'bg-green-100 text-green-800'
    },
    inactive: {
      text: 'Inactive',
      class: 'bg-red-100 text-red-800'
    },
    needs_attention: {
      text: 'Needs Attention',
      class: 'bg-yellow-100 text-yellow-800'
    }
  };

  const currentStatus = statusMap[status as keyof typeof statusMap] || statusMap.inactive;

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${currentStatus.class}`}>
      {currentStatus.text}
    </span>
  );
}
