"use client"

import {
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerXIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useMediaStore } from "@/components/limeplay/media-provider"
import { MuteControl } from "@/components/limeplay/mute-control"

export function VolumeStateControl() {
  const muted = useMediaStore((state) => state.muted)
  const volume = useMediaStore((state) => state.volume)

  return (
    <MuteControl asChild>
      <Button className="cursor-pointer" size="icon" variant="ghost">
        {muted || volume === 0 ? (
          <SpeakerXIcon weight="fill" />
        ) : volume < 0.5 ? (
          <SpeakerLowIcon weight="fill" />
        ) : (
          <SpeakerHighIcon weight="fill" />
        )}
      </Button>
    </MuteControl>
  )
}
