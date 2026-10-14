"use client"

import React from "react"

import { useCaptionsStates } from "@/components/hooks/use-captions"
import { usePictureInPictureStates } from "@/components/hooks/use-picture-in-picture"
import { usePlaybackStates } from "@/components/hooks/use-playback"
import { usePlaybackRateStates } from "@/components/hooks/use-playback-rate"
import { usePlayerStates } from "@/components/hooks/use-player"
import { usePlaylistStates } from "@/components/hooks/use-playlist"
import { useTimelineStates } from "@/components/hooks/use-timeline"
import { useVolumeStates } from "@/components/hooks/use-volume"

export const PlayerHooks = React.memo(() => {
  usePlayerStates()
  usePlaybackStates()
  useTimelineStates()
  useVolumeStates()
  useCaptionsStates()
  usePlaybackRateStates()
  usePlaylistStates()
  usePictureInPictureStates()

  return null
})

PlayerHooks.displayName = "PlayerHooks"
