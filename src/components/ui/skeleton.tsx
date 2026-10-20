import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("lm-shimmer rounded-[10px] bg-[var(--skeleton,#0000000d)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
