'use client'

// Mobile version of the site - accessible at /mobile
// This is a separate route from /navtest to keep desktop version intact
// The desktop version at /navtest remains completely unchanged

// Since Next.js doesn't allow importing page components, we'll use a rewrite approach
// The mobile page will be handled by the same component but with mobile access always allowed

import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Import NavTestPageContent by accessing it through the page file
// We'll use a dynamic import with a workaround
import dynamic from 'next/dynamic'

// Mobile-only wrapper that fixes aria-hidden issue for drawer
// ONLY runs on /mobile route - completely isolated from desktop
function MobileSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { isMobile, openMobile } = useSidebar()
  const pathname = usePathname()
  const isMobileRoute = pathname?.startsWith('/mobile') || false

  // MOBILE ROUTE ONLY: Fix aria-hidden blocking drawer
  // This will NEVER run on desktop /navtest route
  useEffect(() => {
    // Double check - only run on mobile route AND when mobile
    if (!isMobileRoute || !isMobile) return

    if (openMobile) {
      // Remove aria-hidden from wrapper when drawer is open
      const removeAriaHidden = () => {
        const wrapper = document.querySelector('.group\\/sidebar-wrapper') as HTMLElement
        if (wrapper) {
          wrapper.removeAttribute('aria-hidden')
        }
      }
      
      removeAriaHidden()
      const timeoutId = setTimeout(removeAriaHidden, 50)
      
      // Watch for aria-hidden being added back
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
            const target = mutation.target as HTMLElement
            if (target.classList.contains('group/sidebar-wrapper') && target.getAttribute('aria-hidden') === 'true') {
              target.removeAttribute('aria-hidden')
            }
          }
        })
      })
      
      const wrapper = document.querySelector('.group\\/sidebar-wrapper')
      if (wrapper) {
        observer.observe(wrapper, {
          attributes: true,
          attributeFilter: ['aria-hidden']
        })
      }
      
      return () => {
        clearTimeout(timeoutId)
        observer.disconnect()
      }
    }
  }, [isMobileRoute, isMobile, openMobile])

  return <>{children}</>
}

// Create a wrapper that always allows mobile access
const MobileNavTestContent = dynamic(
  async () => {
    // Import the page module
    const navtestModule = await import('@/app/navtest/page')
    // The default export is NavTestPage which wraps NavTestPageContent
    // We need to access NavTestPageContent directly, but it's not exported
    // So we'll create a wrapper component that renders the page but skips the mobile check
    return {
      default: function MobileWrapper() {
        // Render the NavTestPage component which will check pathname
        // Since we're on /mobile, it will allow access
        const NavTestPage = navtestModule.default
        return <NavTestPage />
      }
    }
  },
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-background text-white w-full overflow-hidden">
        <div className="text-center px-4 max-w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70 text-sm">Loading mobile version...</p>
        </div>
      </div>
    )
  }
)

export default function MobilePage() {
  return (
    <SidebarProvider>
      <MobileSidebarWrapper>
        <MobileNavTestContent />
      </MobileSidebarWrapper>
    </SidebarProvider>
  )
}
