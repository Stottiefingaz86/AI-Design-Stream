"use client"

import React from "react"

import { usePlaybackStates } from "@/components/hooks/use-playback"
import { usePlayerStates } from "@/components/hooks/use-player"

export const PlayerHooks = React.memo(() => {
  usePlayerStates()
  usePlaybackStates()

  return null
})

PlayerHooks.displayName = "PlayerHooks"
