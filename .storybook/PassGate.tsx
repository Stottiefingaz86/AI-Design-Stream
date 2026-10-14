import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { getProjectPass, isProjectAuthed, setProjectAuthed } from '../src/lib/access';

export function StorybookPassGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAuthed(isProjectAuthed());
    setReady(true);
  }, []);

  if (!ready) return <div style={{ minHeight: '100vh' }} />;
  if (authed) return children;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (pass === getProjectPass()) {
      setProjectAuthed(true);
      setAuthed(true);
      return;
    }
    setError('Incorrect passcode.');
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground">
        <div>
          <h1 className="text-lg font-semibold">Lumen Storybook</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter the passcode to continue.</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 outline-none"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className="h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground">
          Enter
        </button>
      </form>
    </div>
  );
}
