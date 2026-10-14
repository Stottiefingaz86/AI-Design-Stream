/** Reads the same `.dark` class Storybook's mode toolbar already sets. */
export function useTheme() {
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return {
    resolvedTheme: dark ? 'dark' : 'light',
    theme: dark ? 'dark' : 'light',
    setTheme(next: string) {
      document.documentElement.classList.toggle('dark', next === 'dark');
    },
  };
}

export function ThemeProvider({ children }: { children: unknown }) {
  return children;
}
