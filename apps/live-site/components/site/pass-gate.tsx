'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { getProjectPass, isProjectAuthed, setProjectAuthed } from '@/lib/access'

export function PassGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setAuthed(isProjectAuthed())
    setReady(true)
  }, [])

  if (!ready) {
    return <div className="min-h-svh bg-background" />
  }

  if (authed) return children

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (pass === getProjectPass()) {
      setProjectAuthed(true)
      setAuthed(true)
      return
    }
    setError('Incorrect passcode.')
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--header-inverted,#111)] px-4 text-white">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight">BetOnline</h1>
          <p className="mt-1 text-sm text-white/60">Enter the passcode to open the site.</p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-white/70">Passcode</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pass}
            onChange={(event) => setPass(event.target.value)}
            className="h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-white outline-none focus:border-primary"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className="h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground">
          Enter
        </button>
      </form>
    </div>
  )
}
