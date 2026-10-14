"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils/index"

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  direction?: "top" | "bottom" | "left" | "right"
}

const Drawer = ({
  shouldScaleBackground = false,
  direction = "bottom",
  ...props
}: DrawerProps) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    direction={direction}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Portal>) => {
  // vaul uses Radix Dialog under the hood, which automatically portals to body
  // No need to specify container, it handles it internally
  return <DrawerPrimitive.Portal {...props}>{children}</DrawerPrimitive.Portal>
}
DrawerPortal.displayName = "DrawerPortal"

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, onClick, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out", className)}
    style={{
      ...props.style,
      pointerEvents: 'auto',
      visibility: 'visible',
      zIndex: 9998,
    } as React.CSSProperties}
    onClick={(e) => {
      console.log('DrawerOverlay clicked')
      // Don't prevent default - let vaul handle it
      if (onClick) {
        onClick(e)
      }
    }}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerHandle = ({ 
  className,
  variant = "default",
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "light" | "dark"
}) => {
  const bgColor = variant === "light" 
    ? "bg-gray-400/60" 
    : variant === "dark" 
    ? "bg-white/60" 
    : "bg-white/60"

  return (
    <div 
      className={cn(
        "w-12 h-1.5 rounded-full mx-auto mt-3 mb-2 flex-shrink-0",
        bgColor,
        className
      )}
      style={{ display: 'block', visibility: 'visible', opacity: 1, zIndex: 1000, position: 'relative', pointerEvents: 'auto' }}
      {...props}
    />
  )
}
DrawerHandle.displayName = "DrawerHandle"

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  React.useEffect(() => {
    // Debug: Log when DrawerContent renders
    console.log('DrawerContent rendered')
    return () => {
      console.log('DrawerContent unmounted')
    }
  }, [])

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-[9999] flex flex-col border bg-background",
          "[&[data-vaul-drawer-direction='right']]:inset-y-0 [&[data-vaul-drawer-direction='right']]:right-0 [&[data-vaul-drawer-direction='right']]:h-full [&[data-vaul-drawer-direction='right']]:w-3/4 [&[data-vaul-drawer-direction='right']]:sm:max-w-sm [&[data-vaul-drawer-direction='right']]:rounded-l-[10px] [&[data-vaul-drawer-direction='right']]:border-l",
          "[&[data-vaul-drawer-direction='left']]:inset-y-0 [&[data-vaul-drawer-direction='left']]:left-0 [&[data-vaul-drawer-direction='left']]:h-full [&[data-vaul-drawer-direction='left']]:w-3/4 [&[data-vaul-drawer-direction='left']]:sm:max-w-sm [&[data-vaul-drawer-direction='left']]:rounded-r-[10px] [&[data-vaul-drawer-direction='left']]:border-r",
          "[&[data-vaul-drawer-direction='top']]:inset-x-0 [&[data-vaul-drawer-direction='top']]:top-0 [&[data-vaul-drawer-direction='top']]:rounded-b-[10px] [&[data-vaul-drawer-direction='top']]:border-b [&[data-vaul-drawer-direction='top']]:h-auto",
          "[&[data-vaul-drawer-direction='bottom']]:inset-x-0 [&[data-vaul-drawer-direction='bottom']]:bottom-0 [&[data-vaul-drawer-direction='bottom']]:rounded-t-[10px] [&[data-vaul-drawer-direction='bottom']]:border-t [&[data-vaul-drawer-direction='bottom']]:h-auto",
          className
        )}
        style={{
          ...props.style,
          pointerEvents: 'auto',
          visibility: 'visible',
          opacity: 1,
          zIndex: 9999,
          display: 'flex',
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHandle,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
