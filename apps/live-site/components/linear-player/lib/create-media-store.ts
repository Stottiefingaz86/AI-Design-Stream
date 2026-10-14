import { create } from "zustand"

import type { CaptionsStore } from "@/components/hooks/use-captions"
import type { PlaybackStore } from "@/components/hooks/use-playback"
import type { PlaybackRateStore } from "@/components/hooks/use-playback-rate"
import type { TimelineStore } from "@/components/hooks/use-timeline"
import type { VolumeStore } from "@/components/hooks/use-volume"

import { createCaptionsStore } from "@/components/hooks/use-captions"
import { createPlaybackStore } from "@/components/hooks/use-playback"
import { createPlaybackRateStore } from "@/components/hooks/use-playback-rate"
import {
  createPlayerStore,
  type PlayerStore,
} from "@/components/hooks/use-player"
import { createTimelineStore } from "@/components/hooks/use-timeline"
import { createVolumeStore } from "@/components/hooks/use-volume"

export interface CreateMediaStoreProps {
  debug?: boolean
}

export type TypeMediaStore = CaptionsStore &
  PlaybackRateStore &
  PlaybackStore &
  PlayerStore &
  TimelineStore &
  VolumeStore

export function createMediaStore(initProps?: Partial<CreateMediaStoreProps>) {
  const mediaStore = create<TypeMediaStore>()((...etc) => ({
    ...createPlaybackStore(...etc),
    ...createPlayerStore(...etc),
    ...createVolumeStore(...etc),
    ...createTimelineStore(...etc),
    ...createCaptionsStore(...etc),
    ...createPlaybackRateStore(...etc),

    ...initProps,
  }))
  return mediaStore
}
