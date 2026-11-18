import type { Metadata } from 'next'
import { DesignAgentPage } from '@/components/lumen/design-agent-page'

export const metadata: Metadata = {
  title: 'Design agent — BRD intake',
  description: 'Upload a BRD and run the SpecKit → preview pipeline',
}

export default function DesignAgentRoute() {
  return <DesignAgentPage />
}
