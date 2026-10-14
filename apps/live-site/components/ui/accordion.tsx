"use client"

import * as React from "react"
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

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
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
      <IconChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionContent must be used within Accordion")
  
  const isOpen = context.value.includes(value)
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!contentRef.current) return
    
    if (isOpen) {
      // Set to measured height
      const height = contentRef.current.scrollHeight
      const wrapper = contentRef.current.parentElement as HTMLElement
      if (wrapper) {
        wrapper.style.maxHeight = `${height}px`
      }
    } else {
      // Set to 0
      const wrapper = contentRef.current.parentElement as HTMLElement
      if (wrapper) {
        wrapper.style.maxHeight = '0px'
      }
    }
  }, [isOpen])
  
  // Re-measure when content changes
  React.useEffect(() => {
    if (contentRef.current && isOpen) {
      const height = contentRef.current.scrollHeight
      const wrapper = contentRef.current.parentElement as HTMLElement
      if (wrapper) {
        wrapper.style.maxHeight = `${height}px`
      }
    }
  }, [children, isOpen])
  
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-[max-height,opacity] duration-300 ease-in-out",
        className
      )}
      style={{
        maxHeight: '0px',
        opacity: isOpen ? 1 : 0,
      }}
      {...props}
    >
      <div ref={contentRef} className="pb-4 pt-0">
        {children}
      </div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
