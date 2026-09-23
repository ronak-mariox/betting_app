/**
 * Colour tokens — read straight off the Figma file "Betting App".
 * Figma has no published variables for this file, so the raw hex values from
 * the frames are centralised here and nothing else in the app hard-codes a colour.
 */
export const colors = {
  /* --- Surfaces ------------------------------------------------------- */
  bgVoid: '#030A13', // letterbox behind the phone frame on the Welcome screen
  bgDeep: '#07111F', // darkest navy — outer edges of the splash gradient
  bgBase: '#0D1B2A', // app navy — header top, bottom nav, odds buttons
  surface: '#14253D', // raised card / icon-button background

  /* --- Brand ---------------------------------------------------------- */
  primary: '#1E88E5', // brand blue — active nav, logo gradient start
  primaryMid: '#0D6CC4', // wallet gradient mid stop
  primaryDeep: '#1565C0', // wallet gradient end stop
  accent: '#4FC3F7', // cyan — links, scores, logo gradient end

  /* --- Text ----------------------------------------------------------- */
  textPrimary: '#FFFFFF',
  textBright: '#F0F4FF', // emoji glyph colour
  textMuted: '#6B8AA0', // secondary copy, league names
  textDim: '#4A6070', // tertiary copy, inactive nav labels
  iconMuted: '#A8BFCF', // header icon stroke
  textLabel: '#A8BFCF', // form field labels (same value, different role)

  /* --- Status --------------------------------------------------------- */
  live: '#FF3D71', // live badge / notification dot
  success: '#00C853', // wins, "Claim Now"
  danger: '#FF5252', // losses
  gold: '#FFD54F', // bonus headline, filled star, cash-out button
  warning: '#FFC107', // "Open" bet status + its potential-win figure
  oddsAway: '#FF8A65', // away-win odds value

  /* --- Alpha overlays -------------------------------------------------- */
  onPrimary70: 'rgba(255, 255, 255, 0.7)',
  onPrimary60: 'rgba(255, 255, 255, 0.6)',
  onPrimary50: 'rgba(255, 255, 255, 0.5)',
  onPrimary85: 'rgba(255, 255, 255, 0.85)',
  glass: 'rgba(255, 255, 255, 0.2)', // Deposit button
  glassSoft: 'rgba(255, 255, 255, 0.12)', // Withdraw button
  glassCircle: 'rgba(255, 255, 255, 0.1)', // decorative circle + progress track
  tintAccent: 'rgba(79, 195, 247, 0.15)', // referral icon well / Invite pill
  tintRow: 'rgba(30, 136, 229, 0.04)', // match-card hint + footer rows
  tintLive: 'rgba(255, 61, 113, 0.1)', // overs pill
  tintPrimary: 'rgba(30, 136, 229, 0.08)', // "Create Account" outline button fill
  tintChipActive: 'rgba(30, 136, 229, 0.15)', // selected market tab fill
  tintStakeActive: 'rgba(30, 136, 229, 0.2)', // selected quick-stake chip fill
  scrim: 'rgba(0, 0, 0, 0.7)', // dimmed backdrop behind the bet slip

  /* --- Feature-tile icon wells (Welcome screen, all 13% alpha) --------- */
  wellGold: 'rgba(255, 213, 79, 0.13)',
  wellSuccess: 'rgba(0, 200, 83, 0.13)',
  wellAccent: 'rgba(79, 195, 247, 0.13)',
  wellLive: 'rgba(255, 61, 113, 0.13)',

  /* --- Bet status pills (all 13% alpha) -------------------------------- */
  pillOpen: 'rgba(255, 193, 7, 0.13)',
  pillWon: 'rgba(0, 200, 83, 0.13)',
  pillLost: 'rgba(255, 82, 82, 0.13)',

  /* --- Wallet ---------------------------------------------------------- */
  onPrimary60Alt: 'rgba(255, 255, 255, 0.6)', // "+₹725 won today"
  wellSuccessSoft: 'rgba(0, 200, 83, 0.08)', // credit transaction icon well
  wellDangerSoft: 'rgba(255, 82, 82, 0.08)', // debit transaction icon well
  chipSuccess: 'rgba(0, 200, 83, 0.12)', // "success" tag
  chipAccent: 'rgba(79, 195, 247, 0.12)', // "settled" tag
  chipWarning: 'rgba(255, 193, 7, 0.12)', // "pending" tag

  /* --- Deposit --------------------------------------------------------- */
  chipSuccessStrong: 'rgba(0, 200, 83, 0.15)', // "Popular" / "Instant" tags
  borderRadio: 'rgba(255, 255, 255, 0.2)', // unselected payment radio ring

  /* --- Profile --------------------------------------------------------- */
  wellMenu: 'rgba(79, 195, 247, 0.09)', // default menu-row icon well
  wellMenuSuccess: 'rgba(0, 200, 83, 0.09)', // Refer & Earn
  wellMenuGold: 'rgba(255, 213, 79, 0.09)', // Help & Support
  tierGold: 'rgba(255, 213, 79, 0.15)', // "🥇 Gold Member" pill
  glassSoftAlt: 'rgba(255, 255, 255, 0.08)', // header edit button
  dangerSoft: 'rgba(255, 82, 82, 0.08)', // logout button fill
  borderDanger: 'rgba(255, 82, 82, 0.3)',
  borderAccentSoft: 'rgba(79, 195, 247, 0.25)', // profile referral-code card
  borderAccentStrong: 'rgba(79, 195, 247, 0.3)', // referral screen code card
  chipGlass: 'rgba(255, 255, 255, 0.15)', // referral hero stat tiles
  wellDanger: 'rgba(255, 82, 82, 0.1)', // logout-sheet icon well

  /* --- Sign up --------------------------------------------------------- */
  infoBoxBg: 'rgba(30, 136, 229, 0.08)', // "Aasaan Registration" panel
  infoBoxBorder: 'rgba(30, 136, 229, 0.2)',
  infoBoxWell: 'rgba(30, 136, 229, 0.2)',
  bonusPill: 'rgba(0, 200, 83, 0.15)', // "+₹50 Bonus"
  alertBg: 'rgba(255, 61, 113, 0.07)', // save-your-credentials warning
  alertBorder: 'rgba(255, 61, 113, 0.2)',
  alertText: '#FF8A9B',
  copyPill: 'rgba(30, 136, 229, 0.15)',
  eyePill: 'rgba(255, 255, 255, 0.06)',

  /* --- Notifications ---------------------------------------------------- */
  unreadBg: 'rgba(30, 136, 229, 0.07)',
  unreadBorder: 'rgba(30, 136, 229, 0.2)',

  /* --- Withdraw -------------------------------------------------------- */
  calloutWarnBg: 'rgba(255, 193, 7, 0.06)',
  calloutWarnBorder: 'rgba(255, 193, 7, 0.2)',

  /* --- Cash out -------------------------------------------------------- */
  cashOutBg: 'rgba(255, 213, 79, 0.08)', // outlined cash-out button fill
  offerBorder: 'rgba(0, 200, 83, 0.2)', // cash-out offer card border
  borderNeutral: 'rgba(255, 255, 255, 0.15)', // "Keep Bet" button border

  /* --- Info callout (Login screen tip box) ----------------------------- */
  calloutGoldBg: 'rgba(255, 213, 79, 0.05)',
  calloutGoldBorder: 'rgba(255, 213, 79, 0.15)',

  /* --- Borders (all hairlines are 0.701 in Figma) ---------------------- */
  borderCard: 'rgba(255, 255, 255, 0.07)',
  borderHairline: 'rgba(255, 255, 255, 0.05)',
  borderOdds: 'rgba(255, 255, 255, 0.1)',
  borderInput: 'rgba(255, 255, 255, 0.1)', // text fields (same value, different role)
  borderNav: 'rgba(255, 255, 255, 0.08)',
  borderTile: 'rgba(255, 255, 255, 0.06)', // Welcome feature tiles + search rows
  borderSheet: 'rgba(255, 255, 255, 0.08)', // bet-slip selection card
  borderPrimary: 'rgba(30, 136, 229, 0.4)', // "Create Account" outline
  borderLive: 'rgba(255, 61, 113, 0.3)',
  borderAccent: 'rgba(79, 195, 247, 0.2)',
} as const;

/**
 * Gradients. `angle` matches the CSS `linear-gradient(Xdeg, …)` convention
 * (0° points up, increasing clockwise) which react-native-linear-gradient
 * reproduces exactly via `useAngle` + `angle`.
 */
export const gradients = {
  splash: {
    angle: 141.77,
    colors: [colors.bgDeep, colors.bgBase, colors.bgDeep],
    locations: [0.0849, 0.5, 0.9151],
  },
  header: {
    angle: 180,
    colors: [colors.bgBase, colors.bgDeep],
    locations: [0, 1],
  },
  logo: {
    angle: 135,
    colors: [colors.primary, colors.accent],
    locations: [0, 1],
  },
  wallet: {
    angle: 146.62,
    colors: [colors.primary, colors.primaryMid, colors.primaryDeep],
    locations: [0, 0.5, 1],
  },
  bonus: {
    angle: 159.48,
    colors: ['#1B3A2D', '#0F2419'],
    locations: [0, 1],
  },
  referral: {
    angle: 168.41,
    colors: ['#1A1A3E', '#0D0D2A'],
    locations: [0, 1],
  },
  ctaDanger: {
    angle: 161.18,
    colors: [colors.danger, '#C62828'],
    locations: [0, 1],
  },
  successBadge: {
    angle: 135,
    colors: [colors.success, '#00897B'],
    locations: [0, 1],
  },
  referralHero: {
    angle: 141.29,
    colors: [colors.primaryDeep, colors.primary, colors.accent],
    locations: [0, 0.5, 1],
  },
  topReferrer: {
    angle: 157.35,
    colors: ['#1B2A1A', '#0F1F0F'],
    locations: [0, 1],
  },
  profileHero: {
    angle: 152.85,
    colors: [colors.surface, colors.bgBase],
    locations: [0, 1],
  },
  walletBalance: {
    angle: 153.82,
    colors: [colors.primaryDeep, colors.primary, colors.accent],
    locations: [0, 0.5, 1],
  },
  offer: {
    angle: 156.88,
    colors: ['#1B3A2D', '#0F2419'],
    locations: [0, 1],
  },
  ctaSuccess: {
    angle: 161.6,
    colors: [colors.success, '#00962C'],
    locations: [0, 1],
  },
  /** Same stops as ctaSuccess, but the deposit CTA is drawn at 171.11°. */
  ctaSuccessDeposit: {
    angle: 171.11,
    colors: [colors.success, '#00962C'],
    locations: [0, 1],
  },
  /** Same stops as ctaPrimary; the withdraw confirm button is drawn at 162°. */
  ctaPrimaryConfirm: {
    angle: 162,
    colors: [colors.primary, colors.primaryMid],
    locations: [0, 1],
  },
  ctaPrimary: {
    angle: 170.7,
    colors: [colors.primary, colors.primaryMid],
    locations: [0, 1],
  },
  progress: {
    angle: 90,
    colors: [colors.primary, colors.accent],
    locations: [0, 1],
  },
} as const;

export type GradientToken = keyof typeof gradients;
