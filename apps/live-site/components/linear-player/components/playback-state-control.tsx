"use client"

import {
  CircleNotchIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useMediaStore } from "@/components/limeplay/media-provider"
import { PlaybackControl } from "@/components/limeplay/playback-control"

export function PlaybackStateControl() {
  const status = useMediaStore((state) => state.status)

  return (
    <PlaybackControl asChild>
      <Button className="cursor-pointer" size="icon" variant="ghost">
        {status === "playing" ? (
          <PauseIcon weight="fill" />
        ) : status === "ended" ? (
          <RepeatIcon />
        ) : status === "buffering" || status === "loading" ? (
          <CircleNotchIcon className="animate-spin" weight="bold" />
        ) : (
          <PlayIcon weight="fill" />
        )}
      </Button>
    </PlaybackControl>
  )
}
