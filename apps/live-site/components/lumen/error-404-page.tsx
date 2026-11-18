'use client'

import { useRouter } from 'next/navigation'
import { IconArrowLeft, IconHome } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

/**
 * Figma Error Pages → Error Frame (404).
 * Soft primary wash + glitch on the code; shell chrome stays around it.
 */
export function Error404Page() {
  const router = useRouter()
  const { startNavigating } = useShell()

  const goHome = () => {
    startNavigating('/')
    router.push('/')
  }

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    goHome()
  }

  return (
    <section
      data-name="error-404"
      aria-labelledby="error-404-title"
      className="relative flex w-full flex-col items-center justify-start px-6 pb-16 pt-14 md:pb-20 md:pt-28"
    >
      {/* Soft brand wash — Figma radial behind the frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[min(42%,280px)] size-[min(100vw,622px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_22%,transparent)_0%,transparent_68%)] opacity-80"
      />

      <div className="relative z-[1] flex w-full max-w-[618px] flex-col items-center">
        {/* Figma Error Frame “Code” mark — vector 404 (not live type). */}
        <div
          className={cn('error-404-glitch relative shrink-0', 'h-[100px] w-[125px] md:h-[200px] md:w-[250px]')}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/shell/figma/errors/404-code-lg.svg"
            alt=""
            width={250}
            height={200}
            className="error-404-glitch-layer absolute inset-0 size-full object-contain dark:invert"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/shell/figma/errors/404-code-lg.svg"
            alt=""
            width={250}
            height={200}
            className="error-404-glitch-layer error-404-glitch-layer--a absolute inset-0 size-full object-contain dark:invert"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/shell/figma/errors/404-code-lg.svg"
            alt=""
            width={250}
            height={200}
            className="error-404-glitch-layer error-404-glitch-layer--b absolute inset-0 size-full object-contain dark:invert"
          />
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-2.5 px-5 md:mt-5 md:gap-5 md:pb-5">
          <h1
            id="error-404-title"
            className="text-center text-xl font-medium leading-7 text-foreground md:text-3xl md:leading-9"
          >
            Page not found
          </h1>
          <p className="max-w-[578px] text-center text-xs leading-4 text-muted-foreground md:text-sm md:leading-5">
            We couldn&apos;t find what you were looking for. Head home or try a different path.
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-10 md:mt-0">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Button type="button" size="sm" className="h-8 gap-1.5 px-3" onClick={goHome}>
              <IconHome className="size-3.5" strokeWidth={1.75} />
              Go home
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border bg-secondary px-3 text-foreground hover:bg-muted"
              onClick={goBack}
            >
              <IconArrowLeft className="size-3.5" strokeWidth={1.75} />
              Go back
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-[10px] leading-[14px] text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              document.querySelector<HTMLButtonElement>('[aria-label="Open live chat"]')?.click()
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/shell/figma/errors/support-headset.svg"
              alt=""
              width={16}
              height={16}
              className="size-4 opacity-70 dark:invert"
            />
            Need help? Contact support
          </button>
        </div>
      </div>
    </section>
  )
}
