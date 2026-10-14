import { CaptionsStateControl } from "@/components/linear-player/components/captions-state-control"
import { PictureInPictureControl } from "@/components/limeplay/picture-in-picture-control"
import { PlaybackRateControl } from "@/components/linear-player/components/playback-rate-control"
import { PlaybackStateControl } from "@/components/linear-player/components/playback-state-control"
import { Playlist } from "@/components/linear-player/components/playlist"
import { TimelineSliderControl } from "@/components/linear-player/components/timeline-slider-control"
import { VolumeGroupControl } from "@/components/linear-player/components/volume-group-control"
import * as Layout from "@/components/limeplay/player-layout"

export function BottomControls() {
  return (
    <Layout.ControlsBottomContainer>
      <PlaybackStateControl />
      <VolumeGroupControl />
      <TimelineSliderControl />
      <PlaybackRateControl />
      <CaptionsStateControl />
      <PictureInPictureControl />
      <Playlist />
    </Layout.ControlsBottomContainer>
  )
}
