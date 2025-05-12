// src/components/ui/Skeleton.tsx
export const Skeleton = ({
    className = "",
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn("animate-pulse bg-gray-100 dark:bg-gray-800", className)}
      {...props}
    />
  );
  
  // Usage for validator cards:
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
  