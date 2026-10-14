import { createContext, useContext, type ReactNode } from 'react';

const PathnameContext = createContext('/');

export function PathnameProvider({ pathname, children }: { pathname: string; children: ReactNode }) {
  return <PathnameContext.Provider value={pathname}>{children}</PathnameContext.Provider>;
}

export function usePathname() {
  return useContext(PathnameContext);
}

export function useRouter() {
  return { push() {}, replace() {}, prefetch() {}, back() {} };
}

export function useSearchParams() {
  return new URLSearchParams();
}
