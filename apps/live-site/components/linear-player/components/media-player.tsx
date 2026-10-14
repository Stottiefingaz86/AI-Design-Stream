import React from "react"

import type { Asset } from "@/components/hooks/use-asset"

import { cn } from "@/lib/utils"
import { BottomControls } from "@/components/linear-player/components/bottom-controls"
import { PlayerHooks } from "@/components/linear-player/components/player-hooks"
import { CaptionsContainer } from "@/components/limeplay/captions"
import { FallbackPoster } from "@/components/limeplay/fallback-poster"
import { LimeplayLogo } from "@/components/limeplay/limeplay-logo"
import { Media } from "@/components/limeplay/media"
import { MediaProvider } from "@/components/limeplay/media-provider"
import * as Layout from "@/components/limeplay/player-layout"
import { RootContainer } from "@/components/limeplay/root-container"

export interface LinearMediaPlayerProps {
  asset?: Asset
  className?: string
  debug?: boolean
}

export const LinearMediaPlayer = React.forwardRef<
  HTMLDivElement,
  LinearMediaPlayerProps
>(({ className, debug = false }, ref) => {
  return (
    <MediaProvider debug={debug}>
      <RootContainer
        className={cn(
          `
            m-auto w-full
            md:min-w-80
          `,
          className
        )}
        height={720}
        ref={ref}
        width={1280}
      >
        <Layout.PlayerContainer>
          <FallbackPoster className="bg-black">
            <LimeplayLogo />
          </FallbackPoster>
          <Media
            as="video"
            autoPlay={false}
            className="size-full object-cover"
            muted
          />
          <PlayerHooks />
          <Layout.ControlsOverlayContainer />
          <Layout.ControlsContainer className="pb-6">
            <CaptionsContainer />
            <BottomControls />
          </Layout.ControlsContainer>
        </Layout.PlayerContainer>
      </RootContainer>
    </MediaProvider>
  )
})

LinearMediaPlayer.displayName = "LinearMediaPlayer"
