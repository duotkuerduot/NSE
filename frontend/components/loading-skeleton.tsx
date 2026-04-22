import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export function LoadingSkeleton({
  className,
  rows = 3,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={`skeleton-row-${index}`}
          className={index === 0 ? "h-24 w-full" : "h-16 w-full"}
        />
      ))}
    </div>
  );
}
