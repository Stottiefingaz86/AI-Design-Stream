"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface RainBackgroundProps {
  className?: string
  children?: React.ReactNode
  /** Base number of raindrops */
  count?: number
  /** Rain intensity multiplier */
  intensity?: number
  /** Rain angle in degrees (0 = straight down) */
  angle?: number
  /** Rain color */
  color?: string
  /** Enable lightning flashes */
  lightning?: boolean
}

interface Drop {
  x: number
  y: number
  length: number
  speed: number
  opacity: number
  layer: number
}

export function RainBackground({
  className,
  children,
  count = 150,
  intensity = 1,
  angle = 15,
  color = "rgba(174, 194, 224, 0.5)",
  lightning = true,
}: RainBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const flash = flashRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    let width = rect.width
    let height = rect.height
    canvas.width = width
    canvas.height = height

    let animationId: number
    const totalDrops = Math.floor(count * intensity)
    const angleRad = (angle * Math.PI) / 180

    // Create raindrops across 3 depth layers
    const createDrop = (layer: number): Drop => {
      const layerConfig = [
        { speed: 12, length: 15, opacity: 0.2 },  // back
        { speed: 18, length: 20, opacity: 0.35 }, // mid
        { speed: 25, length: 28, opacity: 0.5 },  // front
      ][layer]

      return {
        x: Math.random() * (width + 100) - 50,
        y: Math.random() * height - height,
        length: layerConfig.length + Math.random() * 10,
        speed: layerConfig.speed + Math.random() * 5,
        opacity: layerConfig.opacity + Math.random() * 0.1,
        layer,
      }
    }

    const drops: Drop[] = []
    for (let i = 0; i < totalDrops; i++) {
      const layer = i < totalDrops * 0.3 ? 0 : i < totalDrops * 0.6 ? 1 : 2
      drops.push(createDrop(layer))
    }

    // Lightning
    let nextLightning = Date.now() + 3000 + Math.random() * 5000

    const triggerLightning = () => {
      if (!flash) return
      flash.style.opacity = "0.8"
      setTimeout(() => {
        if (flash) flash.style.opacity = "0.3"
      }, 50)
      setTimeout(() => {
        if (flash) flash.style.opacity = "0"
      }, 150)
      nextLightning = Date.now() + 3000 + Math.random() * 5000
    }

    // Resize handler
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Check lightning
      if (lightning && Date.now() > nextLightning) {
        triggerLightning()
      }

      // Draw drops
      ctx.strokeStyle = color
      ctx.lineCap = "round"

      for (const drop of drops) {
        // Move drop
        drop.y += drop.speed
        drop.x += Math.sin(angleRad) * drop.speed

        // Reset if off screen
        if (drop.y > height + 50) {
          drop.y = -drop.length - Math.random() * 100
          drop.x = Math.random() * (width + 100) - 50
        }

        // Draw
        ctx.globalAlpha = drop.opacity
        ctx.lineWidth = drop.layer === 2 ? 1.5 : drop.layer === 1 ? 1 : 0.5
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(
          drop.x + Math.sin(angleRad) * drop.length,
          drop.y + Math.cos(angleRad) * drop.length
        )
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [count, intensity, angle, color, lightning])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        background: "linear-gradient(to bottom, #0c1018 0%, #1a1f2e 50%, #151922 100%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Lightning flash overlay */}
      {lightning && (
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-blue-100 opacity-0 transition-opacity duration-100"
        />
      )}

      {/* Fog/mist at bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(20, 25, 35, 0.8) 0%, transparent 100%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(8,10,15,0.7) 100%)",
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function RainBackgroundDemo() {
  return <RainBackground />
}
