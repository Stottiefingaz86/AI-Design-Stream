"use client"

import { ClosedCaptioningIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { CaptionsControl } from "@/components/limeplay/captions"
import { useMediaStore } from "@/components/limeplay/media-provider"

export function CaptionsStateControl() {
  const textTrackVisible = useMediaStore((state) => state.textTrackVisible)

  return (
    <CaptionsControl asChild>
      <Button className="cursor-pointer" size="icon" variant="ghost">
        <ClosedCaptioningIcon weight={textTrackVisible ? "fill" : "regular"} />
      </Button>
    </CaptionsControl>
  )
}
