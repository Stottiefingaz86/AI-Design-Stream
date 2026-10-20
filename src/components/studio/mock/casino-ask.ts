/** Poker landing only — not Video Poker, not Casino Originals, not a lobby carousel. */
export function wantsPokerShell(title: string, brief = '', surface = '') {
  const t = `${title} ${brief} ${surface}`.toLowerCase();
  if (/originals|game carousel|games carousel|game shelf|casino|lobby|sub.?nav|banner/.test(t)) {
    if (!/poker\s+(landing|page|lobby)|poker_landing/.test(t)) return false;
  }
  const withoutVideo = t.replace(/video[\s-]*poker/g, ' ');
  return /\bpoker\b/.test(withoutVideo) || /6mrtcwjhxgymlxbwxrlz4i|78[:\-]163252|poker_landing/i.test(withoutVideo);
}

export function wantsCasinoShell(title: string, brief = '', surface = '') {
  const t = `${title} ${brief} ${surface}`.toLowerCase();
  if (wantsOriginalsShelf(title, brief, surface)) return false;
  if (wantsPokerShell(title, brief, surface)) return false;
  return /casino|sub.?nav|lobby|slots|bonus buy|banner/.test(t);
}

/** Banner row under sub-nav — not game shelves, not generic page mocks. */
export function wantsBannerOnly(title: string, brief = '', surface = '') {
  const t = `${title} ${brief} ${surface}`.toLowerCase();
  if (/game tile|shelf|full page|whole lobby|activity table|seo|originals|game carousel|games carousel/.test(t))
    return false;
  if (/sub.?nav|subnav/.test(t) && !/banner|carousel/.test(t)) return false;
  if (/(casino|lobby)\s+(banner\s+)?carousel|banner\s+carousel|lobby\s+carousel/.test(t)) return true;
  return /banner|vip progress|daily races|promo lobby|lobby banner/.test(t);
}

/** Originals (or similar) game shelf under lobby banners — testing ground shell. */
/** Balance / wallet / cashier sheet from header — real shell, not generic mocks. */
export function wantsCashierShell(title: string, brief = '', surface = '') {
  const t = `${title} ${brief} ${surface}`.toLowerCase();
  return /cashier|wallet|balance\s+pill|clicking on the balance|9475[:\-]199943|0wtTKRqpZqC1fnco7NUaXj/.test(t);
}

export function wantsOriginalsShelf(title: string, brief = '', surface = '') {
  const t = `${title} ${brief} ${surface}`.toLowerCase();
  if (wantsBannerOnly(title, brief, surface)) return false;
  return /originals|game carousel|games carousel|carousel with games|game shelf|509-406894|509:406894|casi\s*no\s*carousel|69[:\-]47911.*originals|originals.*69[:\-]47911/.test(
    t,
  );
}
