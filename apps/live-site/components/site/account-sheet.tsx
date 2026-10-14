'use client'

import { Button } from '@/components/ui/button'
import { InputMask } from '@/components/ui/input-mask'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Typography } from '@/components/ui/typography'
import { toast } from 'sonner'

export function AccountSheet({
  open,
  onOpenChange,
  titleText = 'Account settings',
  descriptionText = 'Everything inside the panel is supplied by the consumer as children.',
  confirmText = 'Save changes',
  side = 'right',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  titleText?: string
  descriptionText?: string
  confirmText?: string
  side?: 'right' | 'left'
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <SheetContent side={side} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{titleText}</SheetTitle>
          <SheetDescription>{descriptionText}</SheetDescription>
        </SheetHeader>
        <Separator decorative orientation="horizontal" className="my-4" />
        <div className="flex flex-1 flex-col gap-4">
          <Typography as="p" shape="small" variant="muted">
            Phone number
          </Typography>
          <InputMask
            mask="(___) ___-____"
            placeholder="(555) 000-0000"
            replacement={{ _: /\d/ }}
            size="md"
          />
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              toast.success('Changes saved')
              onOpenChange(false)
            }}
          >
            {confirmText}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
