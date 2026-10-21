import { IconInfoCircle } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function FieldSkeleton() {
  return (
    <div className="flex w-full flex-col gap-0.5 lg:w-[200px]">
      <Skeleton className="h-[14px] w-[100px] rounded" />
      <Skeleton className="h-5 w-full rounded" />
    </div>
  )
}

/** Profile Settings skeleton — Figma 11129:28318. */
export function ProfileSettingsSkeleton({ className }: { className?: string }) {
  return (
    <section
      data-name="section-profile-settings-skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading Profile Settings"
      className={cn(
        'flex w-full flex-col gap-4 bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Profile Settings
        </h1>
        <span className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground">
          <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
        </span>
      </div>

      <div className="rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <Skeleton className="h-[46px] min-w-0 flex-1 rounded-lg" />
          </div>

          <div className="rounded-lg border border-border bg-secondary p-5">
            <div className="flex flex-col gap-6 lg:hidden">
              {Array.from({ length: 9 }, (_, i) => (
                <FieldSkeleton key={i} />
              ))}
            </div>
            <div className="hidden gap-24 lg:flex">
              {Array.from({ length: 3 }, (_, col) => (
                <div key={col} className="flex flex-col gap-6">
                  {Array.from({ length: 3 }, (_, row) => (
                    <FieldSkeleton key={row} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
