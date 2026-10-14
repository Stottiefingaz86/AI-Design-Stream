import { create } from "zustand"

import type { PlaybackStore } from "@/components/hooks/use-playback"
import type { PlayerStore } from "@/components/hooks/use-player"

import { createPlaybackStore } from "@/components/hooks/use-playback"
import { createPlayerStore } from "@/components/hooks/use-player"

export interface CreateMediaStoreProps {
  debug?: boolean
}

export type TypeMediaStore = PlaybackStore & PlayerStore & {}

export function createMediaStore(initProps?: Partial<CreateMediaStoreProps>) {
  const mediaStore = create<TypeMediaStore>()((...etc) => ({
    ...createPlaybackStore(...etc),
    ...createPlayerStore(...etc),
    ...initProps,
  }))
  return mediaStore
}
