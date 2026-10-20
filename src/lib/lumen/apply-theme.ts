/** Match live site + Storybook: brand on `<html data-brand>`, mode via `.dark`. */
export function applyLumenTheme(brand: string, mode: 'light' | 'dark') {
  const html = document.documentElement;
  html.dataset.brand = brand;
  html.classList.toggle('dark', mode === 'dark');
}

export function applyLumenThemeToDocument(doc: Document | null | undefined, brand: string, mode: 'light' | 'dark') {
  const html = doc?.documentElement;
  if (!html) return;
  html.dataset.brand = brand;
  html.classList.toggle('dark', mode === 'dark');
}
