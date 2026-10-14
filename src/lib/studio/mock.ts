/**
 * Turn a brief into a renderable mock spec.
 *
 * This is the stand-in for the Figma / prototype jobs: it picks page sections
 * and component variants from the brief's words so the approval cards show a
 * real Lumen-tokened visual instead of a bare link. Everything rendered from a
 * MockSpec uses tokens only (lint-enforced), so even the stand-in never leaves
 * the design system.
 */
import { TARGETS } from './brand';
import type { StudioProject } from './types';

export type MockSection =
  | 'nav'
  | 'hero'
  | 'stats'
  | 'cards'
  | 'table'
  | 'form'
  | 'slip'
  | 'leaderboard'
  | 'cta'
  | 'activity'
  | 'seo'
  | 'footer';

export type ComponentArchetype = 'button' | 'badge' | 'input' | 'card' | 'chip' | 'surface';

export interface MockSpec {
  brand: string;
  mode: 'light' | 'dark';
  title: string;
  kicker: string;
  summary: string;
  sections: MockSection[];
  /** Nouns used to label rows / cards (e.g. tournaments, games). */
  items: string[];
  primaryAction: string;
  secondaryAction: string;
  archetype: ComponentArchetype;
  platform: 'desktop' | 'mobile' | 'both';
}

export const BREAKPOINTS = [
  { id: 'xs', label: 'Mobile · 375', width: 375 },
  { id: 'md', label: 'Tablet · 1200', width: 1200 },
  { id: 'lg', label: 'Desktop · 1440', width: 1440 },
] as const;

const has = (s: string, ...words: string[]) => words.some((w) => s.includes(w));

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function deriveMock(p: StudioProject): MockSpec {
  const text = `${p.title} ${p.brief} ${p.surface}`.toLowerCase();
  const theme = (p.briefAnswers?.theme ?? '').toLowerCase();
  const platform = (p.briefAnswers?.platform ?? '').toLowerCase();
  const brand = theme.includes('default') ? 'default' : TARGETS.liveSiteBrand;
  const mode: MockSpec['mode'] = theme.includes('dark') && !theme.includes('light') ? 'dark' : 'light';

  let sections: MockSection[];
  let items: string[];
  let primaryAction = 'Get started';
  let secondaryAction = 'Learn more';
  let kicker = p.surface || 'Feature';

  if (has(text, 'poker')) {
    sections = ['nav', 'hero', 'stats', 'table', 'cards', 'cta', 'footer'];
    items = ['Sunday Major · $100K GTD', 'Turbo Bounty · $25K GTD', 'Daily Deepstack · $10K GTD', 'Sit & Go · 6-max', 'Spin to Win', 'Freeroll · New players'];
    primaryAction = 'Register';
    secondaryAction = 'View schedule';
    kicker = kicker || 'Poker';
  } else if (has(text, 'casino', 'slot', 'live dealer', 'blackjack', 'roulette')) {
    sections = ['nav', 'cards', 'activity', 'seo', 'footer'];
    items = ['Big Bass Bonanza', 'Gates of Olympus', 'Lightning Roulette', 'Blackjack Live', 'Sweet Bonanza', 'Crazy Time'];
    primaryAction = 'Play now';
    secondaryAction = 'All games';
  } else if (has(text, 'bet slip', 'betslip', 'stake', 'parlay', 'wager')) {
    sections = ['nav', 'slip', 'footer'];
    items = ['Chiefs −3.5 · −110', 'Lakers ML · +140', 'Over 47.5 · −105'];
    primaryAction = 'Place bet';
    secondaryAction = 'Clear slip';
  } else if (has(text, 'sports', 'odds', 'match', 'fixture', 'league')) {
    sections = ['nav', 'hero', 'table', 'cards', 'footer'];
    items = ['NFL · Chiefs @ Bills', 'NBA · Lakers @ Celtics', 'EPL · Arsenal v Liverpool', 'UFC · Main event', 'MLB · Yankees @ Dodgers', 'Tennis · ATP Final'];
    primaryAction = 'Bet now';
    secondaryAction = 'All markets';
  } else if (has(text, 'account', 'profile', 'settings', 'login', 'sign up', 'signup', 'register', 'kyc', 'deposit', 'withdraw', 'payment')) {
    sections = ['nav', 'form', 'footer'];
    items = ['Full name', 'Email', 'Phone', 'Date of birth'];
    primaryAction = has(text, 'deposit') ? 'Deposit' : has(text, 'withdraw') ? 'Withdraw' : 'Save changes';
    secondaryAction = 'Cancel';
  } else if (has(text, 'vip', 'reward', 'loyalty', 'leaderboard', 'tier', 'level')) {
    sections = ['nav', 'hero', 'stats', 'leaderboard', 'cta', 'footer'];
    items = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    primaryAction = 'View rewards';
    secondaryAction = 'How it works';
  } else if (has(text, 'promo', 'landing', 'bonus', 'offer', 'campaign')) {
    sections = ['nav', 'hero', 'cards', 'cta', 'footer'];
    items = ['Welcome bonus', 'Reload Friday', 'Refer a friend', 'Odds boost'];
    primaryAction = 'Claim offer';
    secondaryAction = 'Terms';
  } else {
    sections = ['nav', 'hero', 'cards', 'table', 'cta', 'footer'];
    items = ['Item one', 'Item two', 'Item three', 'Item four', 'Item five', 'Item six'];
  }

  if (p.kind === 'component') sections = [];

  let archetype: ComponentArchetype = 'surface';
  if (has(text, 'button', 'cta')) archetype = 'button';
  else if (has(text, 'badge', 'tag', 'pill', 'label')) archetype = 'badge';
  else if (has(text, 'input', 'field', 'search', 'form')) archetype = 'input';
  else if (has(text, 'card', 'tile', 'panel')) archetype = 'card';
  else if (has(text, 'chip', 'stake', 'toggle', 'segment', 'filter')) archetype = 'chip';

  const body = sentences(p.brief);
  return {
    brand,
    mode,
    title: p.title,
    kicker,
    summary: body[0] ?? `${p.title} for ${p.surface || 'the product'}.`,
    sections,
    items,
    primaryAction,
    secondaryAction,
    archetype,
    platform: platform.includes('mobile') ? 'mobile' : platform.includes('both') ? 'both' : 'desktop',
  };
}

/** Real Storybook (:6006) story for a component archetype — lumen-ui sidebar ids. */
export function storybookStoryUrl(archetype: ComponentArchetype, opts: { iframe?: boolean } = {}): string {
  const id = {
    button: 'lumen-ui-button--all-variants',
    badge: 'lumen-ui-badge--all-tones',
    input: 'lumen-ui-input--default',
    card: 'lumen-ui-card--variants',
    chip: 'lumen-ui-chip--group',
    surface: 'lumen-ui-card--variants',
  }[archetype];
  return opts.iframe
    ? `${TARGETS.storybookUrl}/iframe.html?id=${id}&viewMode=story`
    : `${TARGETS.storybookUrl}/?path=/story/${id}`;
}

/** Turn a Storybook manager URL into an embeddable iframe. */
export function storybookIframeUrl(url: string): string {
  if (url.includes('/iframe.html')) return url;
  const m = url.match(/path=\/story\/([^&]+)/);
  if (m) return `${TARGETS.storybookUrl}/iframe.html?id=${m[1]}&viewMode=story`;
  return url;
}

export function prototypeUrlFor(project: StudioProject) {
  return project.artifacts.prototypeUrl ?? `/prototype?id=${encodeURIComponent(project.id)}`;
}

/** Pick which mock a review stage should show. */
export function mockUrlFor(project: StudioProject, stage: StudioProject['status']): string | null {
  const id = encodeURIComponent(project.id);
  switch (stage) {
    case 'needs_design_review':
      return `/prototype?id=${id}&view=frames`;
    case 'needs_prototype_review':
    case 'needs_build_review':
    case 'needs_signoff':
      return project.kind === 'component' ? `/component?id=${id}` : `/prototype?id=${id}`;
    case 'needs_storybook_review':
      return `/component?id=${id}`;
    default:
      return null;
  }
}
