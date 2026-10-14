"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { IconChevronDown } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value: string[]
  onValueChange: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

interface AccordionProps {
  type?: "single" | "multiple"
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  collapsible?: boolean
  children: React.ReactNode
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", defaultValue, value, onValueChange, collapsible = true, children, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(
      defaultValue ? [defaultValue] : value ? [value] : []
    )
    
    const controlledValue = value ? [value] : undefined
    const currentValue = controlledValue || internalValue
    
    // Sync internal state when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value ? [value] : [])
      }
    }, [value])
    
    const handleValueChange = React.useCallback((itemValue: string) => {
      if (type === "single") {
        const newValue = currentValue.includes(itemValue) 
          ? (collapsible ? [] : currentValue)
          : [itemValue]
        if (onValueChange) {
          onValueChange(newValue[0] || "")
        }
        setInternalValue(newValue)
      } else {
        const newValue = currentValue.includes(itemValue)
          ? currentValue.filter(v => v !== itemValue)
          : [...currentValue, itemValue]
        setInternalValue(newValue)
      }
    }, [type, currentValue, onValueChange, collapsible])
    
    return (
      <AccordionContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b border-white/10", className)}
    data-value={value}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  showArrow?: boolean
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, value, showArrow = true, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionTrigger must be used within Accordion")
  
  const isOpen = context.value.includes(value)
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline w-full text-left",
        isOpen && "[&>svg]:rotate-180",
        className
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
      {showArrow && (
        <IconChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      )}
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  keepRendered?: boolean
}

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, value, keepRendered = false, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionContent must be used within Accordion")
  
  const isOpen = context.value.includes(value)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number>(0)
  
  React.useEffect(() => {
    const measureHeight = () => {
      if (contentRef.current) {
        // Always measure the full height, even when closed
        const measuredHeight = contentRef.current.scrollHeight
        setHeight(measuredHeight)
      }
    }
    
    // Measure on mount and when content changes
    measureHeight()
    
    // Use ResizeObserver to track content size changes
    const resizeObserver = new ResizeObserver(() => {
      measureHeight()
    })
    
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [children])
  
  const { onAnimationStart, onAnimationEnd, ...motionProps } = props as any
  
  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{
        height: isOpen ? height : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ overflow: "hidden" }}
      className={cn("text-sm", className)}
      {...motionProps}
    >
      <div ref={contentRef} className="pb-4 pt-0">
        {children}
      </div>
    </motion.div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
