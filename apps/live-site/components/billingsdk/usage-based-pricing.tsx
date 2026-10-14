"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

export type UsageBasedPricingProps = {
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  snapTo?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  currency?: string;
  basePrice?: number;
  includedCredits?: number;
  unitPricePerCredit?: number;
  title?: string;
  subtitle?: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    n,
  );
}

export function UsageBasedPricing({
  className,
  min = 4000,
  max = 25001,
  step = 1,
  snapTo,
  value: valueProp,
  defaultValue = 4000,
  onChange,
  onChangeEnd,
  currency = "$",
  basePrice = 39.99,
  includedCredits = 4000,
  title = "Pay as you use pricing",
  subtitle = "Start with a flat monthly rate that includes 4,000 credits.",
}: UsageBasedPricingProps) {
  const isMobile = useIsMobile()
  const isControlled = typeof valueProp === "number";
  const [uncontrolled, setUncontrolled] = useState(
    clamp(defaultValue, min, max),
  );
  const value = isControlled
    ? clamp(valueProp as number, min, max)
    : uncontrolled;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [posPct, setPosPct] = useState(
    () => ((value - min) / (max - min)) * 100,
  );
  const animRef = useRef<number | null>(null);
  const animStartRef = useRef<number>(0);
  const animFromPctRef = useRef<number>(0);
  const animToPctRef = useRef<number>(0);
  const animDurationMs = 300;
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const suppressClickRef = useRef(false);

  // measure track width for ticks
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setTrackWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Animate the deposit amount value
  const valueSpring = useSpring(value, {
    stiffness: 140,
    damping: 18,
    mass: 0.6,
  });
  useEffect(() => {
    valueSpring.set(value);
  }, [value, valueSpring]);
  const valueRounded = useTransform(valueSpring, (v: number) => Math.max(0, v));
  const [valueText, setValueText] = useState(value.toFixed(2));
  useMotionValueEvent(valueRounded, "change", (v) => {
    setValueText((v as number).toFixed(2));
  });

  // keep visual position in sync with external value changes (controlled)
  useEffect(() => {
    // avoid interrupting during user interactions
    if (isPointerDownRef.current) return;
    if (animRef.current) return;
    const pctFromValue = ((value - min) / (max - min)) * 100;
    setPosPct(clamp(pctFromValue, 0, 100));
  }, [value, min, max]);

  const pct = posPct;
  const tickCount = useMemo(
    () => Math.max(80, Math.floor((trackWidth || 1) / 6)),
    [trackWidth],
  );
  const currentTickIndexFloat = useMemo(
    () => (posPct / 100) * (tickCount - 1),
    [posPct, tickCount],
  );

  const commitValue = (v: number, fireEnd = false) => {
    const clamped = clamp(v, min, max);
    if (!isControlled) setUncontrolled(clamped);
    onChange?.(clamped);
    if (fireEnd) onChangeEnd?.(clamped);
  };

  const quantize = (raw: number) => {
    const stepped = Math.round(raw / step) * step;
    return clamp(stepped, min, max);
  };

  // Get snap value based on current value range
  const getSnapValue = (val: number) => {
    // For deposit slider: 25-500 uses snapTo of 25, 500-10000 uses snapTo of 100
    if (min === 25 && max === 10000) {
      if (val <= 500) {
        return 25; // First range: 25-500, snap to 25
      } else {
        return 100; // Second range: 500-10000, snap to 100
      }
    }
    // Default behavior for other sliders
    return snapTo && snapTo > 0 ? snapTo : 100;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    // do not update immediately; wait for move to avoid jump on simple click
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.buttons !== 1 || !isPointerDownRef.current) return;
    hasMovedRef.current = true;
    updateFromEvent(e, false);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Only commit if there was a drag; a simple click will be handled by onClick animation
    if (hasMovedRef.current) {
      updateFromEvent(e, true);
      // skip the trailing synthetic click fired after a drag
      suppressClickRef.current = true;
    }
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    isPointerDownRef.current = false;
    hasMovedRef.current = false;
  };
  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    isPointerDownRef.current = false;
    hasMovedRef.current = false;
  };
  // easing function for dot click animation
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  // animate to target value (used by clickable dots)
  const animateTo = (targetValue: number) => {
    // cancel any existing animation
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const tnorm = (targetValue - min) / (max - min);
    animFromPctRef.current = posPct;
    animToPctRef.current = clamp(tnorm * 100, 0, 100);
    animStartRef.current = performance.now();
    const step = (now: number) => {
      const elapsed = now - animStartRef.current;
      const p = Math.min(1, elapsed / animDurationMs);
      const k = easeOutCubic(p);
      const currPct =
        animFromPctRef.current +
        (animToPctRef.current - animFromPctRef.current) * k;
      setPosPct(currPct);
      // live update the value with dynamic snap increments during animation
      const liveValue = min + (currPct / 100) * (max - min);
      const moveSnap = getSnapValue(liveValue);
      let next = Math.round(liveValue / moveSnap) * moveSnap;
      // Ensure we don't cross the 500 boundary incorrectly
      if (min === 25 && max === 10000) {
        if (liveValue > 500 && next < 500) {
          next = 500;
        } else if (liveValue < 500 && next > 500) {
          next = 500;
        }
      }
      next = clamp(next, min, max);
      commitValue(next, false);
      if (p < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        // finalize exactly on target and fire end
        commitValue(targetValue, true);
        animRef.current = null;
      }
    };
    animRef.current = requestAnimationFrame(step);
  };
  const updateFromEvent = (
    e: React.PointerEvent<HTMLDivElement>,
    isEnd: boolean,
  ) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const t = x / rect.width;
    const raw = min + t * (max - min);
    // update transient visual percent immediately
    setPosPct(t * 100);
    // During move: update visuals and value in live increments with dynamic snap
    if (!isEnd) {
      const moveSnap = getSnapValue(raw);
      let next = Math.round(raw / moveSnap) * moveSnap;
      // Ensure we don't cross the 500 boundary incorrectly
      if (min === 25 && max === 10000) {
        if (next < 500 && raw > 500) {
          next = 500;
        } else if (next > 500 && raw < 500) {
          next = 500;
        }
      }
      next = clamp(next, min, max);
      commitValue(next, false);
      return;
    }
    // On end: snap with dynamic snap value
    let next = raw;
    const endSnap = getSnapValue(raw);
    if (endSnap > 0) {
      next = Math.round(raw / endSnap) * endSnap;
      // Ensure we snap to the correct side of 500 boundary
      if (min === 25 && max === 10000) {
        if (next < 500 && raw > 500) {
          next = 500;
        } else if (next > 500 && raw < 500) {
          next = 500;
        }
      }
    } else if (step && step > 1) {
      next = quantize(raw);
    } else {
      next = Math.round(raw / 100) * 100;
    }
    commitValue(next, true);
  };

  // Positions for labels at min and max
  const startLabel = `${formatNumber(min)}`;
  const endLabel = `${formatNumber(max)}`;

  // Keyboard Accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    const baseStep = getSnapValue(value);
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        delta = -(e.shiftKey ? baseStep * 5 : baseStep);
        break;
      case "ArrowRight":
      case "ArrowUp":
        delta = e.shiftKey ? baseStep * 5 : baseStep;
        break;
      case "Home":
        commitValue(Math.round(min / baseStep) * baseStep, true);
        e.preventDefault();
        return;
      case "End":
        commitValue(Math.round(max / baseStep) * baseStep, true);
        e.preventDefault();
        return;
      default:
        return;
    }
    e.preventDefault();
    const next = clamp(value + delta, min, max);
    const snapped = Math.round(next / baseStep) * baseStep;
    commitValue(snapped, true);
  };

  return (
    <Card className={cn("mx-auto w-full max-w-3xl min-w-lg bg-gray-50 border-gray-200", className)}>
      <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
        <div className="flex flex-col items-center">
          <div className={cn("flex flex-col items-center", isMobile ? "mb-3" : "mb-6")}>
            <p className={cn("text-gray-600 font-medium", isMobile ? "text-xs mb-1" : "text-sm mb-2")}>Deposit Amount</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("font-bold tabular-nums text-gray-900", isMobile ? "text-3xl" : "text-5xl")}>
                {currency}
                {valueText}
              </span>
            </div>
          </div>

          <div className="w-full">
            <div
              ref={trackRef}
              className={cn("relative select-none", isMobile ? "h-8 mb-0.5" : "h-16 mb-1")}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onClick={(e) => {
              e.stopPropagation();
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              if (!trackRef.current) return;
              const rect = trackRef.current.getBoundingClientRect();
              const x = clamp(e.clientX - rect.left, 0, rect.width);
              const t = x / rect.width;
              const raw = min + t * (max - min);
              const baseSnap = getSnapValue(raw);
              let target = Math.round(raw / baseSnap) * baseSnap;
              // Ensure we snap to the correct side of 500 boundary
              if (min === 25 && max === 10000) {
                if (target < 500 && raw > 500) {
                  target = 500;
                } else if (target > 500 && raw < 500) {
                  target = 500;
                }
              }
              target = clamp(target, min, max);
              animateTo(target);
            }}
          >
            {/* Animated ruler ticks */}
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: tickCount }).map((_, i) => {
                const left = (i / (tickCount - 1)) * 100;
                const distFloat = Math.abs(currentTickIndexFloat - i);
                const base = isMobile ? 6 : 10;
                const peak = isMobile ? 8 : 12;
                const spread = 2;
                const factor = Math.max(0, 1 - distFloat / spread);
                const height = base + peak * factor;
                let color = "bg-gray-400";
                if (distFloat < 0.5) color = "bg-gray-900";
                else if (distFloat < 1.5) color = "bg-gray-700";
                else if (distFloat < 2.5) color = "bg-gray-500";
                const widthClass =
                  distFloat < 0.5
                    ? "w-[3px]"
                    : distFloat < 3.5
                      ? "w-[2px]"
                      : "w-px";
                return (
                  <motion.div
                    key={i}
                    className={`absolute top-1/2 -translate-y-full ${widthClass} rounded-full ${color}`}
                    style={{ left: `${left}%` }}
                    animate={{ height }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                );
              })}
            </div>


            <div
              className="absolute top-full -mt-1 -translate-x-1/2 z-10"
              style={{ left: `${pct}%` }}
            >
              <div className={cn("bg-gray-900 text-white rounded-md shadow-sm whitespace-nowrap font-medium", isMobile ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm")}>
                {formatNumber(value)}
              </div>
              <div
                role="slider"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={`${formatNumber(value)}`}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="sr-only"
              />
            </div>
          </div>

            <div className={cn("text-gray-600 flex justify-between px-1", isMobile ? "text-[10px] mt-2" : "text-xs mt-8")}>
              <span>{startLabel}</span>
              <span>{endLabel}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UsageBasedPricing;
