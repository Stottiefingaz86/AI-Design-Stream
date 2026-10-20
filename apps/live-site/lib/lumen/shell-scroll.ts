/** Smooth-scroll a section into view inside the shell scrollport (`#shell-scroll`). */
export function scrollShellToId(id: string, offset = 88) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return

  const scroller = document.getElementById('shell-scroll')
  if (!scroller) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  const top =
    el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - offset
  scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

/** Same-page hash link? Skip full-route navigation chrome. */
export function isInPageHashHref(href: string, pathname: string) {
  const hashIndex = href.indexOf('#')
  if (hashIndex < 0) return false
  const path = href.slice(0, hashIndex) || pathname
  return path === pathname || path === ''
}

export function hashFromHref(href: string) {
  const i = href.indexOf('#')
  return i >= 0 ? href.slice(i + 1) : ''
}
