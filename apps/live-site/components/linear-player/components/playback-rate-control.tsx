"use client"

import * as Select from "@/components/ui/select"
import * as PlaybackRate from "@/components/limeplay/playback-rate"

export function PlaybackRateControl() {
  return (
    <PlaybackRate.SelectRoot>
      <Select.SelectTrigger
        className={`
          border-none bg-transparent shadow-none
          hover:bg-foreground/10
          dark:bg-transparent dark:shadow-none
        `}
      >
        <Select.SelectValue />
      </Select.SelectTrigger>
      <Select.SelectContent
        align="start"
        className={`dark min-w-24 border border-border bg-background/70 backdrop-blur-md backdrop-saturate-[1.15]`}
        position="popper"
        side="top"
      >
        <PlaybackRate.SelectGroup className={`tracking-wider`}>
          <Select.SelectLabel>Playback Rate</Select.SelectLabel>
        </PlaybackRate.SelectGroup>
      </Select.SelectContent>
    </PlaybackRate.SelectRoot>
  )
}
