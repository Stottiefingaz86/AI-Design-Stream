/**
 * Tiny client-side sound helper.
 *
 * Sound files live in `public/sound/<name>.mp3`. We cache one Audio element
 * per sound and rewind it on each play so rapid retriggers (e.g. multiple
 * toasts in quick succession) all fire.
 *
 * Browser autoplay policies block playback until the user has interacted
 * with the page — that's fine, we silently swallow the rejection.
 */

import {
  WHEEL_TICK_AUDIO_LEAD_MS,
  WHEEL_TICK_TRIM_MS,
} from '@/lib/jackpot/constants'

const SOUND_BASE = '/sound'

export type SoundName =
  | 'button-click'
  | 'redeem'
  | 'spin'
  | 'spin-now'
  | 'jackpot-bg'
  | 'jackpot-wheel-spin'
  | 'jackpot-numbers'
  | 'jackpot-intro'
  | 'jackpot-win-screen'
  | 'jackpot-final-segment'
  | 'final-selection-win'
  | 'jackpot-transition'
  | 'highlight'
  | 'highlight-2'

const FILE_MAP: Record<SoundName, string> = {
  // Note: existing assets use spaces in the file names — keep them encoded.
  'button-click': 'button%20click.mp3',
  redeem: 'redeem.mp3',
  spin: 'spin2.mp3',
  'spin-now': 'spin_now.mp3',
  'jackpot-bg': 'jackpot%20bg_music.mp3',
  'jackpot-wheel-spin': 'wheel%20screen.mp3',
  'jackpot-numbers': 'jackpot%20animation_numbers.mp3',
  'jackpot-intro': 'jackpot%20first%20screen.wav',
  'jackpot-win-screen': 'jackpot%20win%20screen.mp3',
  'jackpot-final-segment': 'finalsegment.wav',
  'final-selection-win': 'final%20selection%20win.mp3',
  'jackpot-transition': 'transition_to_jackpot.mp3',
  highlight: 'highlight.mp3',
  'highlight-2': 'highlight_sound2.mp3',
}

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {}
const HIGHLIGHT_POOL_SIZE = 16
let highlightPool: HTMLAudioElement[] | null = null
let highlightPoolIndex = 0
let highlight2Pool: HTMLAudioElement[] | null = null
let highlight2PoolIndex = 0
let wheelTickCtx: AudioContext | null = null
let wheelTickBuffer: AudioBuffer | null = null
let wheelTickBuffer2: AudioBuffer | null = null
let wheelTickBufferPromise: Promise<AudioBuffer | null> | null = null
let wheelTickBuffer2Promise: Promise<AudioBuffer | null> | null = null
let activeSpinTick: AudioBufferSourceNode | null = null
let activeAnticipationTick: AudioBufferSourceNode | null = null
const activeSpinTicks = new Set<AudioBufferSourceNode>()
let bgVolumeRampRaf = 0

/** Turn off pitch preservation so playbackRate changes the pitch (cross-browser). */
function disablePreservesPitch(audio: HTMLAudioElement): void {
  const a = audio as HTMLAudioElement & {
    preservesPitch?: boolean
    mozPreservesPitch?: boolean
    webkitPreservesPitch?: boolean
  }
  a.preservesPitch = false
  a.mozPreservesPitch = false
  a.webkitPreservesPitch = false
}

function initHighlightPool(): HTMLAudioElement[] {
  if (typeof window === 'undefined') return []
  if (highlightPool) return highlightPool
  highlightPool = Array.from({ length: HIGHLIGHT_POOL_SIZE }, () => {
    const audio = new Audio(`${SOUND_BASE}/${FILE_MAP.highlight}`)
    audio.preload = 'auto'
    // Let playbackRate actually change the PITCH (browsers preserve pitch by
    // default, which makes the ticks only speed up, never pitch up).
    disablePreservesPitch(audio)
    audio.load()
    return audio
  })
  return highlightPool
}

function initHighlight2Pool(): HTMLAudioElement[] {
  if (typeof window === 'undefined') return []
  if (highlight2Pool) return highlight2Pool
  highlight2Pool = Array.from({ length: HIGHLIGHT_POOL_SIZE }, () => {
    const audio = new Audio(`${SOUND_BASE}/${FILE_MAP['highlight-2']}`)
    audio.preload = 'auto'
    disablePreservesPitch(audio)
    audio.load()
    return audio
  })
  return highlight2Pool
}

/** Warm both tick pools + decode buffers for Web Audio pitch shifts. */
export function preloadWheelHighlightTicks(): void {
  initHighlightPool()
  initHighlight2Pool()
  void loadWheelTickBuffer('anticipation')
  void loadWheelTickBuffer('spin')
}

function ensureWheelTickContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!wheelTickCtx) {
    wheelTickCtx = new AudioContext({ latencyHint: 'interactive' })
  }
  return wheelTickCtx
}

type WheelTickVariant = 'spin' | 'anticipation'

export type WheelHighlightTickOptions = {
  variant?: WheelTickVariant
  volume?: number
  basePitch?: number
  pitchStep?: number
  pitchBoost?: number
  maxPitch?: number
  playbackRate?: number
}

function wheelTickTrimSec(variant: WheelTickVariant): number {
  return (
    WHEEL_TICK_TRIM_MS[variant === 'spin' ? 'spin' : 'anticipation'] / 1000
  )
}

function createWheelTickSource(
  variant: WheelTickVariant,
  pitch: number,
  volume: number,
  whenSec: number,
  offsetSec = wheelTickTrimSec(variant)
): boolean {
  const buffer = variant === 'spin' ? wheelTickBuffer2 : wheelTickBuffer
  const ctx = ensureWheelTickContext()
  if (!ctx || !buffer) return false
  if (ctx.state === 'suspended') void ctx.resume()

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = pitch
  const gain = ctx.createGain()
  gain.gain.value = volume
  source.connect(gain)
  gain.connect(ctx.destination)
  const startAt = Math.max(whenSec, ctx.currentTime)
  const maxOffset = Math.max(0, buffer.duration - 0.01)
  source.start(startAt, Math.min(offsetSec, maxOffset))

  if (variant === 'spin') {
    activeSpinTicks.add(source)
    activeSpinTick = source
  } else {
    activeAnticipationTick = source
  }
  source.onended = () => {
    if (variant === 'spin') {
      activeSpinTicks.delete(source)
      if (activeSpinTick === source) activeSpinTick = null
    } else if (activeAnticipationTick === source) {
      activeAnticipationTick = null
    }
  }
  return true
}

function resolveWheelTickPitch(
  tickIndex: number,
  options: WheelHighlightTickOptions
): number {
  const basePitch = options.basePitch ?? 0.96
  const pitchStep = options.pitchStep ?? 0.032
  const pitchBoost = options.pitchBoost ?? 0
  const maxPitch = options.maxPitch ?? 2.2
  return (
    options.playbackRate ??
    Math.min(maxPitch, basePitch + tickIndex * pitchStep + pitchBoost)
  )
}

function loadWheelTickBuffer(
  variant: WheelTickVariant = 'anticipation'
): Promise<AudioBuffer | null> {
  if (variant === 'spin') {
    if (wheelTickBuffer2) return Promise.resolve(wheelTickBuffer2)
    if (wheelTickBuffer2Promise) return wheelTickBuffer2Promise
    wheelTickBuffer2Promise = (async () => {
      const ctx = ensureWheelTickContext()
      if (!ctx) return null
      try {
        const res = await fetch(`${SOUND_BASE}/${FILE_MAP['highlight-2']}`)
        const data = await res.arrayBuffer()
        wheelTickBuffer2 = await ctx.decodeAudioData(data)
        return wheelTickBuffer2
      } catch {
        return null
      }
    })()
    return wheelTickBuffer2Promise
  }

  if (wheelTickBuffer) return Promise.resolve(wheelTickBuffer)
  if (wheelTickBufferPromise) return wheelTickBufferPromise
  wheelTickBufferPromise = (async () => {
    const ctx = ensureWheelTickContext()
    if (!ctx) return null
    try {
      const res = await fetch(`${SOUND_BASE}/${FILE_MAP.highlight}`)
      const data = await res.arrayBuffer()
      wheelTickBuffer = await ctx.decodeAudioData(data)
      return wheelTickBuffer
    } catch {
      return null
    }
  })()
  return wheelTickBufferPromise
}

function stopActiveWheelTick(variant: WheelTickVariant): void {
  if (variant === 'spin') {
    for (const source of activeSpinTicks) {
      try {
        source.stop()
      } catch {
        // already stopped
      }
    }
    activeSpinTicks.clear()
    activeSpinTick = null
    return
  }

  if (!activeAnticipationTick) return
  try {
    activeAnticipationTick.stop()
  } catch {
    // already stopped
  }
  activeAnticipationTick = null
}

/** Resume Web Audio tick context — call from a user gesture before spin. */
export function resumeWheelTickAudio(): void {
  const ctx = ensureWheelTickContext()
  if (ctx?.state === 'suspended') {
    void ctx.resume()
  }
}

/** Decode both tick buffers before the spin loop starts. */
export function ensureWheelTickBuffersReady(): Promise<void> {
  return Promise.all([
    loadWheelTickBuffer('anticipation'),
    loadWheelTickBuffer('spin'),
  ]).then(() => undefined)
}

/** Stop all in-flight wheel tick one-shots — prevents overlap desync on repeat spins. */
export function stopWheelHighlightTicks(): void {
  if (typeof window === 'undefined') return
  stopActiveWheelTick('spin')
  stopActiveWheelTick('anticipation')
  for (const audio of initHighlightPool()) {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch {
      // no-op
    }
  }
  for (const audio of initHighlight2Pool()) {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch {
      // no-op
    }
  }
  highlightPoolIndex = 0
  highlight2PoolIndex = 0
}

function getAudio(name: SoundName, volume: number): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  let audio = cache[name]
  if (!audio) {
    audio = new Audio(`${SOUND_BASE}/${FILE_MAP[name]}`)
    audio.preload = 'auto'
    cache[name] = audio
  }
  audio.volume = volume
  return audio
}

/** Spin CTA — play in the user-gesture handler (not via unlock mute cycle). */
export function playSpinNowSound(volume = 0.85): HTMLAudioElement | null {
  const audio = getAudio('spin-now', volume)
  if (!audio) return null
  audio.muted = false
  audio.loop = false
  audio.currentTime = 0
  try {
    const result = audio.play()
    if (result && typeof (result as Promise<void>).catch === 'function') {
      ;(result as Promise<void>).catch(() => {})
    }
  } catch {
    // no-op
  }
  return audio
}

interface PlaySoundOptions {
  /** 0–1. Defaults: click 0.5, redeem 0.7, spin 0.5, jackpot-bg 0.3. */
  volume?: number
  loop?: boolean
}

/**
 * Play a sound and return the underlying `HTMLAudioElement` so the caller can
 * pause / stop it (handy for the spin sound, which we cut off the moment the
 * reel lands on a result). Returns `null` on the server or if the audio can't
 * be created. Callers that don't need to stop the sound can ignore the return
 * value — the existing fire-and-forget call sites are unaffected.
 */
export function playSound(
  name: SoundName,
  options: PlaySoundOptions = {}
): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const defaultVolume =
    name === 'redeem'
      ? 0.7
      : name === 'jackpot-bg'
        ? 0.3
        : name === 'jackpot-wheel-spin'
          ? 0.38
          : name === 'jackpot-numbers'
          ? 1
          : name === 'jackpot-win-screen'
            ? 0.52
            : name === 'highlight'
            ? 0.5
            : name === 'highlight-2'
              ? 0.5
              : name === 'spin-now'
              ? 0.85
              : name === 'final-selection-win'
              ? 0.9
              : name === 'jackpot-transition'
                ? 0.48
                : 0.5
  const audio = getAudio(name, options.volume ?? defaultVolume)
  if (!audio) return null
  audio.loop = options.loop ?? false
  try {
    audio.currentTime = 0
    const result = audio.play()
    // Some browsers return a Promise; ignore rejections (autoplay policy etc.)
    if (result && typeof (result as Promise<void>).catch === 'function') {
      ;(result as Promise<void>).catch(() => {})
    }
  } catch {
    // no-op — sound is purely cosmetic
  }
  return audio
}

/** Proceed when a one-shot sound ends, or at `maxWaitMs` — whichever comes first. */
export function afterSound(
  audio: HTMLAudioElement | null,
  maxWaitMs: number,
  onDone: () => void
): () => void {
  let done = false
  const finish = () => {
    if (done) return
    done = true
    audio?.removeEventListener('ended', finish)
    clearTimeout(timer)
    onDone()
  }
  audio?.addEventListener('ended', finish, { once: true })
  const timer = setTimeout(finish, maxWaitMs)
  return finish
}

/** Warm sounds used in the wheel → win overlay handoff. */
export function preloadJackpotWinHandoffAudio(): void {
  if (typeof window === 'undefined') return
  getAudio('jackpot-final-segment', 0.88)?.load()
  getAudio('jackpot-transition', 0.48)?.load()
  getAudio('jackpot-win-screen', 0.52)?.load()
}

/** Start the looping bed immediately — retries until buffered or playing. */
export function startJackpotBgMusicImmediate(bgVolume = 0.3): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const bg = getAudio('jackpot-bg', bgVolume)
  if (!bg) return null

  bg.loop = true
  bg.volume = bgVolume

  if (!bg.paused && bg.currentTime > 0.05) {
    return bg
  }

  const tryPlay = () => {
    if (!bg.paused && bg.currentTime > 0.05) return
    try {
      const result = bg.play()
      if (result && typeof result.catch === 'function') {
        result.catch(() => {})
      }
    } catch {
      // no-op
    }
  }

  if (bg.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    bg.load()
  }

  tryPlay()

  if (bg.paused) {
    const onReady = () => tryPlay()
    bg.addEventListener('canplay', onReady, { once: true })
    bg.addEventListener('canplaythrough', onReady, { once: true })
  }

  return bg
}

/** Smooth volume change — never restarts playback or drops to silence mid-song. */
export function rampJackpotBgVolume(
  targetVolume: number,
  durationMs = 700
): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const bg = getAudio('jackpot-bg', targetVolume)
  if (!bg) return null

  bg.loop = true

  const coldStart = bg.paused || bg.currentTime <= 0.05
  if (coldStart) {
    bg.volume = 0
    try {
      if (bg.paused) bg.currentTime = 0
      const result = bg.play()
      if (result && typeof result.catch === 'function') {
        result.catch(() => {})
      }
    } catch {
      // no-op
    }
  }

  const startVolume = coldStart ? 0 : bg.volume
  const started = performance.now()
  cancelAnimationFrame(bgVolumeRampRaf)

  const step = () => {
    const t = Math.min(1, (performance.now() - started) / durationMs)
    bg.volume = startVolume + (targetVolume - startVolume) * t
    if (t < 1) bgVolumeRampRaf = requestAnimationFrame(step)
  }
  bgVolumeRampRaf = requestAnimationFrame(step)
  return bg
}

/** Fade the looping jackpot bed in from silence (or ramp up if already playing). */
export function fadeInJackpotBgMusic(targetVolume = 0.3, durationMs = 2400): HTMLAudioElement | null {
  return rampJackpotBgVolume(targetVolume, durationMs)
}

/** Preload wheel sounds only — does not start playback. */
export function preloadJackpotWheelAudio(bgVolume = 0.3): void {
  if (typeof window === 'undefined') return
  const bg = getAudio('jackpot-bg', bgVolume)
  const intro = getAudio('jackpot-intro', 0.92)
  getAudio('spin-now', 0.85)?.load()
  getAudio('jackpot-wheel-spin', 0.38)?.load()
  if (bg) {
    bg.loop = true
    bg.load()
  }
  intro?.load()
}

/** @deprecated Use preloadJackpotWheelAudio — load only, no autoplay. */
export function preloadJackpotIntroAudio(bgVolume = 0.3): void {
  preloadJackpotWheelAudio(bgVolume)
}

/** Intro screen — bed fades in; intro sting plays on top. */
export function startJackpotIntroAudio(bgVolume = 0.3): void {
  if (typeof window === 'undefined') return
  fadeInJackpotBgMusic(bgVolume, 2400)

  const intro = getAudio('jackpot-intro', 0.92)
  if (!intro) return

  try {
    if (intro.paused) {
      intro.currentTime = 0
    }
    const introResult = intro.play()
    if (introResult && typeof introResult.catch === 'function') {
      introResult.catch(() => {})
    }
  } catch {
    // no-op — sound is purely cosmetic
  }
}

/** Looping jackpot bed — keeps playing if already started (wheel → overlay handoff). */
export function playJackpotBgMusic(options: PlaySoundOptions = {}): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const volume = options.volume ?? 0.3
  const existing = cache['jackpot-bg']
  if (existing && !existing.paused && existing.loop) {
    return existing
  }
  return playSound('jackpot-bg', { ...options, volume, loop: true })
}

/** (Re)start the looping bed if it was paused — never drops volume while playing. */
export function ensureJackpotBgMusic(volume = 0.3): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const existing = cache['jackpot-bg']
  if (existing) {
    existing.loop = true
    if (existing.paused) {
      existing.volume = volume
      try {
        const result = existing.play()
        if (result && typeof (result as Promise<void>).catch === 'function') {
          ;(result as Promise<void>).catch(() => {})
        }
      } catch {
        // no-op
      }
    }
    return existing
  }
  return playJackpotBgMusic({ volume, loop: true })
}

export function setJackpotBgVolume(volume: number): void {
  const audio = cache['jackpot-bg']
  if (audio) audio.volume = volume
}

export function isJackpotBgAudible(threshold = 0.05): boolean {
  const bg = cache['jackpot-bg']
  return !!(bg && !bg.paused && bg.volume > threshold && bg.currentTime > 0.05)
}

/** Looping wheel bed — plays during zoom/spin until jackpot handoff. */
export function startJackpotWheelSpinMusic(volume = 0.38): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const existing = cache['jackpot-wheel-spin']
  if (existing && !existing.paused && existing.loop) {
    return existing
  }
  return playSound('jackpot-wheel-spin', { volume, loop: true })
}

/** Keep the wheel bed running if it was paused mid-spin. */
export function ensureJackpotWheelSpinMusic(volume = 0.38): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  const existing = cache['jackpot-wheel-spin']
  if (existing) {
    existing.loop = true
    if (existing.paused) {
      existing.volume = volume
      try {
        const result = existing.play()
        if (result && typeof (result as Promise<void>).catch === 'function') {
          ;(result as Promise<void>).catch(() => {})
        }
      } catch {
        // no-op
      }
    }
    return existing
  }
  return startJackpotWheelSpinMusic(volume)
}

/** Crossfade intro bed out and wheel bed in when the player taps Spin. */
export function swapJackpotBedForWheelSpin(
  wheelVolume = 0.38,
  fadeOutMs = 500
): HTMLAudioElement | null {
  fadeOutSound('jackpot-bg', fadeOutMs)
  return startJackpotWheelSpinMusic(wheelVolume)
}

/** Pre-schedule wheel ticks on the Web Audio clock — sample-accurate, immune to RAF jank. */
export function scheduleWheelHighlightTicks(
  events: Array<{
    atSec: number
    tickIndex: number
    options?: WheelHighlightTickOptions
  }>
): boolean {
  if (typeof window === 'undefined' || !events.length) return false
  const ctx = ensureWheelTickContext()
  if (!ctx || !wheelTickBuffer || !wheelTickBuffer2) return false
  if (ctx.state === 'suspended') void ctx.resume()

  let scheduled = 0
  for (const ev of events) {
    const variant = ev.options?.variant ?? 'anticipation'
    const pitch = resolveWheelTickPitch(ev.tickIndex, ev.options ?? {})
    const volume = Math.min(1, ev.options?.volume ?? 0.82)
    if (createWheelTickSource(variant, pitch, volume, ev.atSec)) {
      scheduled += 1
    }
  }
  return scheduled === events.length
}

/** Schedule ticks relative to spin start (ms) — aligns with the wheel physics timeline. */
export function scheduleWheelCrossingTicks(
  events: Array<{
    atMs: number
    tickIndex: number
    options?: WheelHighlightTickOptions
  }>,
  /** Ms already elapsed since the spin animation started — keeps audio aligned if buffers load late. */
  elapsedMs = 0
): boolean {
  const ctx = ensureWheelTickContext()
  if (!ctx || !events.length) return false
  if (ctx.state === 'suspended') void ctx.resume()
  const anchor = ctx.currentTime - elapsedMs / 1000
  const audioLeadSec = WHEEL_TICK_AUDIO_LEAD_MS / 1000
  return scheduleWheelHighlightTicks(
    events.map((ev) => ({
      atSec: anchor + Math.max(0, ev.atMs) / 1000 - audioLeadSec,
      tickIndex: ev.tickIndex,
      options: ev.options,
    }))
  )
}

/** One-shot wheel tick — pitch rises via Web Audio (reliable cross-browser). */
export function playWheelHighlightTick(
  tickIndex: number,
  options: WheelHighlightTickOptions = {}
): void {
  if (typeof window === 'undefined') return

  const variant = options.variant ?? 'anticipation'
  const pitch = resolveWheelTickPitch(tickIndex, options)
  const volume = Math.min(1, options.volume ?? 0.82)

  const playFromPool = (): boolean => {
    const pool = variant === 'spin' ? initHighlight2Pool() : initHighlightPool()
    if (!pool.length) return false
    const trimSec = wheelTickTrimSec(variant)

    // Anticipation stays monophonic; spin ticks round-robin without cutting.
    if (variant === 'anticipation') {
      for (const pooled of pool) {
        if (!pooled.paused) {
          pooled.pause()
          pooled.currentTime = trimSec
        }
      }
    }

    const audio =
      variant === 'spin'
        ? pool[highlight2PoolIndex++ % pool.length]
        : pool[highlightPoolIndex++ % pool.length]
    audio.volume = volume
    disablePreservesPitch(audio)
    audio.playbackRate = pitch
    audio.currentTime = trimSec
    try {
      const result = audio.play()
      if (result && typeof result.catch === 'function') {
        result.catch(() => {})
      }
    } catch {
      // no-op
    }
    return true
  }

  const playViaWebAudio = (): boolean => {
    const ctx = ensureWheelTickContext()
    const buffer = variant === 'spin' ? wheelTickBuffer2 : wheelTickBuffer
    if (!ctx || !buffer) return false
    if (variant === 'anticipation') stopActiveWheelTick(variant)
    return createWheelTickSource(variant, pitch, volume, ctx.currentTime)
  }

  // Web Audio first — trim skips MP3 leading silence; lowest scheduling latency.
  if (playViaWebAudio()) return
  if (playFromPool()) return

  void loadWheelTickBuffer(variant).then((decoded) => {
    if (decoded) playWheelHighlightTick(tickIndex, options)
  })
}

/** Fade a looping sound out, then stop and rewind it. */
export function fadeOutSound(name: SoundName, durationMs = 900): void {
  const audio = cache[name]
  if (!audio || audio.paused) return
  const startVolume = audio.volume
  const started = performance.now()
  const step = () => {
    const elapsed = performance.now() - started
    const t = Math.min(1, elapsed / durationMs)
    audio.volume = startVolume * (1 - t)
    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      stopSound(name)
      audio.volume = startVolume
    }
  }
  requestAnimationFrame(step)
}

/**
 * Unlock audio playback on touch/mobile devices. Call this from a user gesture
 * handler (e.g. the Spin CTA tap). iOS/Safari keeps every HTMLAudioElement
 * locked until it has been `.play()`-ed inside a gesture, so later programmatic
 * plays (the spin tick pool, win sounds) are silently blocked. We briefly play
 * each element muted and pause it, which marks them as user-unlocked.
 */
export function unlockAudioPlayback(): void {
  if (typeof window === 'undefined') return
  resumeWheelTickAudio()
  void loadWheelTickBuffer('anticipation')
  void loadWheelTickBuffer('spin')
  const pool = initHighlightPool()
  initHighlight2Pool()
  // Make sure the sounds we'll fire later during the spin actually exist now, so
  // they get unlocked by this same gesture (otherwise iOS blocks them later).
  const primed: SoundName[] = [
    'jackpot-intro',
    'jackpot-win-screen',
    'jackpot-bg',
    'jackpot-wheel-spin',
    'jackpot-numbers',
    'jackpot-final-segment',
    'final-selection-win',
    'jackpot-transition',
    'highlight',
    'highlight-2',
  ]
  for (const name of primed) {
    if (name === 'jackpot-bg' && isJackpotBgAudible(0.02)) continue
    if (name === 'jackpot-wheel-spin') {
      const wheel = cache['jackpot-wheel-spin']
      if (wheel && !wheel.paused && wheel.loop) continue
    }
    getAudio(name, 0.0001)
  }
  const elements: HTMLAudioElement[] = [
    ...pool,
    ...initHighlight2Pool(),
    ...primed
      .map((name) => cache[name])
      .filter((a): a is HTMLAudioElement => !!a),
  ]
  for (const audio of elements) {
    // Only skip unlock rewind if the bed is already audibly playing mid-flow.
    const bed = cache['jackpot-bg']
    const wheelBed = cache['jackpot-wheel-spin']
    if (audio === bed && !bed.paused && bed.currentTime > 0.05) continue
    if (audio === wheelBed && !wheelBed.paused && wheelBed.loop) continue
    try {
      const wasMuted = audio.muted
      audio.muted = true
      const result = audio.play()
      if (result && typeof (result as Promise<void>).then === 'function') {
        ;(result as Promise<void>)
          .then(() => {
            audio.pause()
            audio.currentTime = 0
            audio.muted = wasMuted
          })
          .catch(() => {
            audio.muted = wasMuted
          })
      } else {
        audio.pause()
        audio.currentTime = 0
        audio.muted = wasMuted
      }
    } catch {
      // no-op — best-effort unlock
    }
  }
}

/** Stop a sound immediately and rewind it. Safe to call if the sound was
 * never played. */
export function stopSound(name: SoundName): void {
  const audio = cache[name]
  if (!audio) return
  try {
    audio.pause()
    audio.currentTime = 0
    audio.loop = false
  } catch {
    // no-op
  }
}
