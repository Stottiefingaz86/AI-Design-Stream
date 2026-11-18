/** Fallback product slot when a route has no page content. */
export function ShellContent() {
  return (
    <div
      data-name="content area"
      className="flex min-h-[670px] flex-1 items-center justify-center bg-background p-6"
    >
      <p className="text-sm text-muted-foreground">Nothing here yet</p>
    </div>
  )
}
