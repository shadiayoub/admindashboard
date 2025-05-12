// src/components/ui/Loader.tsx
import { cn } from "@/lib/utils";

export const Loader = ({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-primary-500",
          sizes[size]
        )}
      />
    </div>
  );
};
