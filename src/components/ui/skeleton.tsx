import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-amber-pulse rounded-md bg-amber/20", className)} {...props} />;
}

export { Skeleton };
