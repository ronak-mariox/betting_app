import {colors as themeColors, gradients as themeGradients} from './colors';

// colors.ts declares its tokens `as const` (literal types) but doesn't freeze them;
// the brand is the one place allowed to rewrite them, before any screen reads them.
const colors = themeColors as unknown as Record<keyof typeof themeColors, string>;
const gradients = themeGradients as unknown as Record<keyof typeof themeGradients, {colors: string[]}>;

/**
 * Settings → Brand from the admin panel (GET /api/branding). Screens build
 * their StyleSheets once, at import, so the brand is applied to `colors` /
 * `gradients` before the app's modules load (see index.js); a change made in
 * the panel shows from the next app start.
 *
 * Only this file and colors.ts may be imported before that — never the theme
 * index (typography reads the colours when it loads).
 */
export type Branding = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  successColor: string;
};

/** The app's name as players see it; "BetPro" until a brand name is set. */
export const brand = {name: 'BetPro'};

const HEX = /^#[0-9a-f]{6}$/i;
const toRgb = (hex: string) =>
  [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) =>
  `#${rgb
    .map(c => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0'))
    .join('')}`;
/** Toward white (amount > 0) or black (amount < 0). */
const shade = (hex: string, amount: number) =>
  toHex(
    toRgb(hex).map(c => (amount > 0 ? c + (255 - c) * amount : c * (1 + amount))),
  );
const alpha = (hex: string, a: number) => `rgba(${toRgb(hex).join(', ')}, ${a})`;

/** Replaces a gradient's stops in place (StyleSheets keep the same array). */
const setStops = (stops: string[], next: string[]) => {
  stops.splice(0, stops.length, ...next);
};

/** Puts the brand on the theme. Empty / invalid fields keep the built-in look. */
export function applyBranding(next: Partial<Branding> | null | undefined) {
  if (!next) {
    return;
  }
  if (next.brandName?.trim()) {
    brand.name = next.brandName.trim();
  }
  const primary = HEX.test(next.primaryColor ?? '') ? next.primaryColor! : '';
  const accent = HEX.test(next.accentColor ?? '') ? next.accentColor! : '';
  const bg = HEX.test(next.backgroundColor ?? '') ? next.backgroundColor! : '';
  const success = HEX.test(next.successColor ?? '') ? next.successColor! : '';

  if (primary) {
    colors.primary = primary;
    colors.primaryMid = shade(primary, -0.15);
    colors.primaryDeep = shade(primary, -0.28);
    colors.tintRow = alpha(primary, 0.04);
    colors.tintPrimary = alpha(primary, 0.08);
    colors.tintChipActive = alpha(primary, 0.15);
    colors.tintStakeActive = alpha(primary, 0.2);
  }
  const cyan = accent || (primary ? shade(primary, 0.35) : '');
  if (cyan) {
    colors.accent = cyan;
    colors.tintAccent = alpha(cyan, 0.15);
    colors.wellAccent = alpha(cyan, 0.13);
    colors.chipAccent = alpha(cyan, 0.12);
    colors.wellMenu = alpha(cyan, 0.09);
  }
  if (bg) {
    colors.bgBase = bg;
    colors.bgDeep = shade(bg, -0.35);
    colors.bgVoid = shade(bg, -0.6);
    colors.surface = shade(bg, 0.07);
  }
  if (success) {
    colors.success = success;
    colors.wellSuccess = alpha(success, 0.13);
    colors.pillWon = alpha(success, 0.13);
    colors.chipSuccess = alpha(success, 0.12);
    colors.chipSuccessStrong = alpha(success, 0.15);
    colors.wellSuccessSoft = alpha(success, 0.08);
    colors.wellMenuSuccess = alpha(success, 0.09);
  }

  setStops(gradients.splash.colors, [colors.bgDeep, colors.bgBase, colors.bgDeep]);
  setStops(gradients.header.colors, [colors.bgBase, colors.bgDeep]);
  setStops(gradients.logo.colors, [colors.primary, colors.accent]);
  setStops(gradients.wallet.colors, [colors.primary, colors.primaryMid, colors.primaryDeep]);
  setStops(gradients.referralHero.colors, [colors.primaryDeep, colors.primary, colors.accent]);
  setStops(gradients.walletBalance.colors, [colors.primaryDeep, colors.primary, colors.accent]);
  gradients.successBadge.colors[0] = colors.success;
}
