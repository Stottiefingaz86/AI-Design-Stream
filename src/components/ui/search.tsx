import type { ComponentProps } from 'react'
import { MicIcon, SearchIcon } from 'lucide-react'
import { cn } from 'cn'
import { Kbd } from '@/components/ui/kbd'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

function Search({
  className,
  shortcut = '⌘K',
  voice,
  ...props
}: ComponentProps<'input'> & { shortcut?: string; voice?: boolean }) {
  return (
    <InputGroup className={cn('max-w-sm', className)} data-slot="search">
      <InputGroupAddon>
        <SearchIcon data-icon="inline-start" />
      </InputGroupAddon>
      <InputGroupInput type="search" placeholder="Search…" {...props} />
      <InputGroupAddon align="inline-end">
        {voice ? <MicIcon className="text-muted-foreground" /> : null}
        {shortcut ? <Kbd>{shortcut}</Kbd> : null}
      </InputGroupAddon>
    </InputGroup>
  )
}

function SearchSimple({ className, ...props }: ComponentProps<'input'>) {
  return <Input type="search" className={cn('max-w-sm', className)} placeholder="Search…" {...props} />
}

export { Search, SearchSimple }
