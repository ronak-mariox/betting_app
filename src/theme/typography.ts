import {StyleSheet, TextStyle} from 'react-native';
import {colors} from './colors';
import {fontScale} from './layout';

/**
 * The Figma file uses Poppins in five weights. `fontWeight` is declared
 * alongside `fontFamily` so the UI still reads correctly with the system font
 * if the TTFs haven't been linked yet (see README → Fonts).
 */
export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  extraBold: 'Poppins-ExtraBold',
} as const;

const weights: Record<keyof typeof fonts, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

const font = (
  weight: keyof typeof fonts,
  size: number,
  lineHeight: number,
  extra: TextStyle = {},
): TextStyle => ({
  fontFamily: fonts[weight],
  fontWeight: weights[weight],
  fontSize: fontScale(size),
  lineHeight: fontScale(lineHeight),
  ...extra,
});

/**
 * Named type styles. The comment on each line is the Figma spec:
 * `weight size/lineHeight — colour`.
 */
export const type = StyleSheet.create({
  /* --- KYC ------------------------------------------------------------ */
  kycTitle: font('extraBold', 24, 32, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // ExtraBold 24/32 — #FFFFFF
  kycDoneTitle: font('extraBold', 20, 28, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // ExtraBold 20/28 — #FFFFFF
  kycSafeNote: font('regular', 11, 16.5, {
    color: colors.textDim,
    textAlign: 'center',
  }), // Regular 11/16.5 — #4A6070, "safe" in #4FC3F7
  kycStepLabel: font('semiBold', 9, 13.5, {color: colors.textDim}), // SemiBold 9/13.5 — #4A6070 (#4FC3F7 when reached)
  kycSectionHead: font('semiBold', 12, 16, {
    color: colors.textMuted,
    letterSpacing: fontScale(0.6),
    textTransform: 'uppercase',
  }), // SemiBold 12/16 — #6B8AA0, tracking 0.6, uppercase
  kycEdit: font('semiBold', 12, 16, {color: colors.accent}), // SemiBold 12/16 — #4FC3F7
  kycRowLabel: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0
  kycRowValue: font('medium', 12, 16, {
    color: colors.textPrimary,
    textAlign: 'right',
  }), // Medium 12/16 — #FFFFFF
  kycFileName: font('regular', 12, 16, {color: colors.textLabel}), // Regular 12/16 — #A8BFCF
  kycUploadTitle: font('semiBold', 14, 20, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // SemiBold 14/20 — #FFFFFF
  kycUploadHint: font('medium', 11, 16.5, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Medium 11/16.5 — #6B8AA0
  kycUploadCta: font('semiBold', 12, 16, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // SemiBold 12/16 — #FFFFFF
  kycUploadedName: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  kycUploadedOk: font('regular', 11, 16.5, {color: colors.success}), // Regular 11/16.5 — #00C853
  kycSummaryLabel: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0
  kycSummaryValue: font('semiBold', 12, 16, {color: colors.textPrimary}), // SemiBold 12/16 — #FFFFFF

  /* --- Splash --------------------------------------------------------- */
  splashTitle: font('extraBold', 36, 40, {
    color: colors.textPrimary,
    letterSpacing: fontScale(-0.9),
    textAlign: 'center',
  }), // ExtraBold 36/40 — #FFFFFF, tracking -0.9
  splashTagline: font('medium', 14, 20, {
    color: colors.textMuted,
    letterSpacing: fontScale(1.4),
    textAlign: 'center',
  }), // Medium 14/20 — #6B8AA0, tracking 1.4, uppercase
  splashLoading: font('regular', 12, 16, {
    color: colors.textDim,
    textAlign: 'center',
  }), // Regular 12/16 — #4A6070

  /* --- Welcome -------------------------------------------------------- */
  welcomeTitle: font('extraBold', 30, 36, {color: colors.textPrimary}), // ExtraBold 30/36 — #FFFFFF
  welcomeTagline: font('regular', 14, 22.75, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Regular 14/22.75 — #6B8AA0
  featureTitle: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  featureSub: font('regular', 11, 16.5, {color: colors.textMuted}), // Regular 11/16.5 — #6B8AA0
  terms: font('regular', 12, 16, {
    color: colors.textDim,
    textAlign: 'center',
  }), // Regular 12/16 — #4A6070, links in #4FC3F7

  /* --- Login / forms --------------------------------------------------- */
  screenTitle: font('bold', 18, 22.5, {color: colors.textPrimary}), // Bold 18/22.5 — #FFFFFF
  screenSubtitle: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0
  fieldLabel: font('medium', 12, 16, {color: colors.textLabel}), // Medium 12/16 — #A8BFCF
  input: font('regular', 14, 20, {color: colors.textPrimary}), // Regular 14 — #FFFFFF (placeholder #4A6070)
  calloutTitle: font('semiBold', 12, 16, {color: colors.gold}), // SemiBold 12/16 — #FFD54F
  calloutBody: font('regular', 11, 17.875, {color: colors.textMuted}), // Regular 11/17.875 — #6B8AA0
  emojiLg: font('regular', 16, 24, {color: colors.textBright}), // Regular 16/24 — #F0F4FF
  footerNote: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0
  footerLink: font('semiBold', 16, 24, {color: colors.accent}), // SemiBold 16/24 — #4FC3F7
  footerLinkSm: font('medium', 12, 16, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Medium 12/16 — #6B8AA0

  /* --- Match detail ---------------------------------------------------- */
  matchTitle: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  bigScore: font('extraBold', 24, 32, {
    color: colors.accent,
    textAlign: 'center',
  }), // ExtraBold 24/32 — #4FC3F7
  scoreMeta: font('regular', 11, 16.5, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Regular 11/16.5 — #6B8AA0
  versusMuted: font('bold', 12, 16, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Bold 12/16 — #6B8AA0
  badgeMini: font('bold', 9, 13.5, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Bold 9/13.5 — #FFFFFF
  chip: font('semiBold', 12, 16, {textAlign: 'center'}), // SemiBold 12/16 — colour varies
  oddsTeamLg: font('medium', 12, 16, {
    color: colors.textLabel,
    textAlign: 'center',
  }), // Medium 12/16 — #A8BFCF
  oddsValueLg: font('extraBold', 20, 28, {
    color: colors.accent,
    textAlign: 'center',
  }), // ExtraBold 20/28 — #4FC3F7
  statText: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0

  /* --- Deposit ---------------------------------------------------------- */
  amountInput: font('bold', 20, 28, {color: colors.textPrimary}), // Bold 20 — #FFFFFF (placeholder 50% white)
  successTitle: font('bold', 24, 32, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Bold 24/32 — #FFFFFF
  successSub: font('regular', 14, 20, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Regular 14/20 — #6B8AA0
  changeMethod: font('medium', 14, 20, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Medium 14/20 — #6B8AA0

  /* --- Sign up -------------------------------------------------------------- */
  infoBoxTitle: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  infoBoxBody: font('regular', 12, 19.5, {color: colors.textMuted}), // Regular 12/19.5 — #6B8AA0
  consent: font('medium', 12, 19.5, {color: colors.textMuted}), // Medium 12/19.5 — #6B8AA0
  referralInput: font('semiBold', 14, 20, {
    color: colors.textPrimary,
    letterSpacing: fontScale(1.4),
  }), // SemiBold 14/20 — tracking 1.4
  bonusLabel: font('bold', 10, 15, {color: colors.success}), // Bold 10/15 — #00C853
  createdTitle: font('extraBold', 20, 28, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // ExtraBold 20/28 — #FFFFFF
  createdBody: font('regular', 14, 22.75, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Regular 14/22.75 — #6B8AA0
  createdHighlight: font('semiBold', 14, 22.75, {color: colors.gold}), // SemiBold 14/22.75 — #FFD54F
  alertBody: font('regular', 11, 17.875, {color: colors.alertText}), // Regular 11/17.875 — #FF8A9B
  credentialLabel: font('medium', 12, 16, {
    color: colors.textMuted,
    letterSpacing: fontScale(0.3),
  }), // Medium 12/16 — #6B8AA0, tracking 0.3, uppercase
  credentialValue: font('bold', 18, 28, {
    color: colors.textPrimary,
    letterSpacing: fontScale(0.45),
  }), // Bold 18/28 — #FFFFFF, tracking 0.45
  credentialMasked: font('bold', 18, 28, {
    color: colors.textPrimary,
    letterSpacing: fontScale(1.8),
  }), // Bold 18/28 — tracking 1.8

  /* --- Referral ------------------------------------------------------------ */
  heroTitle: font('extraBold', 24, 32, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // ExtraBold 24/32 — #FFFFFF
  heroSub: font('regular', 14, 20, {
    color: colors.onPrimary70,
    textAlign: 'center',
  }), // Regular 14/20 — 70% white
  heroStatValue: font('extraBold', 16, 24, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // ExtraBold 16/24 — #FFFFFF
  heroStatLabel: font('regular', 10, 15, {
    color: colors.onPrimary70,
    textAlign: 'center',
  }), // Regular 10/15 — 70% white
  referralCodeLg: font('extraBold', 24, 32, {
    color: colors.accent,
    letterSpacing: fontScale(2.4),
  }), // ExtraBold 24/32 — #4FC3F7, tracking 2.4
  shareEmoji: font('regular', 16, 24, {textAlign: 'center'}), // Regular 16/24
  shareLabel: font('regular', 10, 15, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Regular 10/15 — #FFFFFF
  stepNumber: font('bold', 14, 20, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Bold 14/20 — #FFFFFF
  creditAmount: font('bold', 14, 20, {
    color: colors.success,
    textAlign: 'right',
  }), // Bold 14/20 — #00C853
  creditNote: font('regular', 10, 15, {
    color: colors.success,
    textAlign: 'right',
  }), // Regular 10/15 — #00C853
  trophyEmoji: font('regular', 30, 36, {
    color: colors.textBright,
    textAlign: 'center',
  }), // Regular 30/36 — #F0F4FF
  topName: font('extraBold', 20, 28, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // ExtraBold 20/28 — #FFFFFF

  /* --- Help & Support ------------------------------------------------------ */
  faqAnswer: font('regular', 14, 22.75, {color: colors.textLabel}), // Regular 14/22.75 — #A8BFCF
  categoryLabel: font('medium', 12, 16, {
    color: colors.textLabel,
    textAlign: 'center',
  }), // Medium 12/16 — #A8BFCF

  /* --- Edit profile ------------------------------------------------------- */
  avatarLg: font('bold', 30, 36, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Bold 30/36 — #FFFFFF
  fieldCaption: font('medium', 11, 16.5, {color: colors.textMuted}), // Medium 11/16.5 — #6B8AA0
  mobileValue: font('regular', 14, 20, {color: colors.textLabel}), // Regular 14/20 — #A8BFCF
  verifiedLabel: font('regular', 10, 15, {color: colors.success}), // Regular 10/15 — #00C853

  /* --- Notifications ------------------------------------------------------ */
  emojiXl: font('regular', 24, 32, {color: colors.textBright}), // Regular 24/32 — #F0F4FF
  notifTitle: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  notifBody: font('regular', 12, 19.5, {color: colors.textMuted}), // Regular 12/19.5 — #6B8AA0
  notifTime: font('regular', 10, 15, {color: colors.textDim}), // Regular 10/15 — #4A6070

  /* --- Settings ----------------------------------------------------------- */
  groupHeading: font('semiBold', 12, 16, {
    color: colors.textMuted,
    letterSpacing: fontScale(0.6),
  }), // SemiBold 12/16 — #6B8AA0, tracking 0.6, uppercase
  settingLabel: font('medium', 14, 20, {color: colors.textPrimary}), // Medium 14/20 — #FFFFFF
  settingSub: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0
  settingValue: font('medium', 12, 16, {color: colors.textMuted}), // Medium 12/16 — #6B8AA0
  langPill: font('semiBold', 12, 16, {textAlign: 'center'}), // SemiBold 12/16 — colour varies

  /* --- Profile ------------------------------------------------------------ */
  avatarInitials: font('bold', 24, 32, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Bold 24/32 — #FFFFFF
  profileName: font('bold', 18, 28, {color: colors.textPrimary}), // Bold 18/28 — #FFFFFF
  tierPill: font('bold', 10, 15, {color: colors.gold}), // Bold 10/15 — #FFD54F
  profileStat: font('bold', 16, 24, {
    color: colors.textPrimary,
    textAlign: 'center',
  }), // Bold 16/24 — #FFFFFF
  profileStatLabel: font('regular', 11, 16.5, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Regular 11/16.5 — #6B8AA0
  referralCode: font('extraBold', 18, 28, {
    color: colors.accent,
    letterSpacing: fontScale(1.8),
  }), // ExtraBold 18/28 — #4FC3F7, tracking 1.8
  menuLabel: font('medium', 14, 20, {color: colors.textPrimary}), // Medium 14/20 — #FFFFFF
  menuHint: font('medium', 11, 16.5, {color: colors.success}), // Medium 11/16.5 — #00C853
  logoutLabel: font('semiBold', 16, 24, {
    color: colors.danger,
    textAlign: 'center',
  }), // SemiBold 16/24 — #FF5252

  /* --- Withdraw ---------------------------------------------------------- */
  confirmLabel: font('regular', 14, 20, {color: colors.textMuted}), // Regular 14/20 — #6B8AA0
  confirmValue: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  warnText: font('regular', 12, 19.5, {color: colors.warning}), // Regular 12/19.5 — #FFC107
  helperText: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0

  /* --- Wallet ----------------------------------------------------------- */
  balanceLabel: font('regular', 12, 16, {color: colors.onPrimary70}), // Regular 12/16 — 70% white
  balanceMeta: font('regular', 12, 16, {color: colors.onPrimary60Alt}), // Regular 12/16 — 60% white
  tileLabel: font('regular', 12, 16, {color: colors.textMuted}), // Regular 12/16 — #6B8AA0
  tileValue: font('bold', 18, 28, {color: colors.textPrimary}), // Bold 18/28 — #FFFFFF
  txnTitle: font('medium', 14, 20, {color: colors.textPrimary}), // Medium 14/20 — #FFFFFF
  txnAmount: font('bold', 14, 20, {textAlign: 'right'}), // Bold 14/20 — colour varies
  txnStatus: font('regular', 10, 15, {textAlign: 'right'}), // Regular 10/15 — colour varies

  /* --- Live matches ----------------------------------------------------- */
  emptyNote: font('regular', 14, 20, {
    color: colors.textDim,
    textAlign: 'center',
  }), // Regular 14/20 — #4A6070

  /* --- My Bets --------------------------------------------------------- */
  pageTitle: font('bold', 20, 28, {color: colors.textPrimary}), // Bold 20/28 — #FFFFFF
  statusPill: font('bold', 10, 15, {}), // Bold 10/15 — colour varies
  selectionLabel: font('regular', 12, 16, {color: colors.accent}), // Regular 12/16 — #4FC3F7
  selectionName: font('semiBold', 12, 16, {color: colors.accent}), // SemiBold 12/16 — #4FC3F7
  betStatLabel: font('regular', 10, 15, {color: colors.textMuted}), // Regular 10/15 — #6B8AA0
  betStatValue: font('bold', 14, 20, {color: colors.textPrimary}), // Bold 14/20 — colour varies
  cashOutLabel: font('bold', 12, 16, {
    color: colors.gold,
    textAlign: 'center',
  }), // Bold 12/16 — #FFD54F

  /* --- Cash out sheet --------------------------------------------------- */
  offerLabel: font('regular', 12, 16, {
    color: colors.textMuted,
    textAlign: 'center',
  }), // Regular 12/16 — #6B8AA0
  offerAmount: font('extraBold', 36, 40, {
    color: colors.success,
    textAlign: 'center',
  }), // ExtraBold 36/40 — #00C853
  offerPercent: font('bold', 12, 16, {color: colors.success}), // Bold 12/16 — #00C853
  noteText: font('regular', 12, 19.5, {color: colors.textMuted}), // Regular 12/19.5 — #6B8AA0
  noteHighlight: font('semiBold', 12, 19.5, {color: colors.success}), // SemiBold 12/19.5 — #00C853
  sheetButton: font('bold', 14, 20, {textAlign: 'center'}), // Bold 14/20 — colour varies

  /* --- Bet slip -------------------------------------------------------- */
  sheetTitle: font('bold', 16, 24, {color: colors.textPrimary}), // Bold 16/24 — #FFFFFF
  slipLabel: font('regular', 11, 16.5, {color: colors.textMuted}), // Regular 11/16.5 — #6B8AA0
  selectionValue: font('bold', 14, 20, {color: colors.accent}), // Bold 14/20 — #4FC3F7
  stakeInput: font('bold', 18, 28, {color: colors.textPrimary}), // Bold 18/28 — #FFFFFF
  summaryValue: font('semiBold', 12, 16, {color: colors.textPrimary}), // SemiBold 12/16 — #FFFFFF

  /* --- Search overlay --------------------------------------------------- */
  linkStrong: font('semiBold', 14, 20, {color: colors.accent}), // SemiBold 14/20 — #4FC3F7 ("Cancel")
  suggestion: font('medium', 14, 20, {color: colors.textLabel}), // Medium 14/20 — #A8BFCF

  /* --- Header --------------------------------------------------------- */
  greeting: font('medium', 12, 16, {color: colors.textMuted}), // Medium 12/16 — #6B8AA0
  userName: font('bold', 18, 28, {color: colors.textPrimary}), // Bold 18/28 — #FFFFFF

  /* --- Wallet card ---------------------------------------------------- */
  walletLabel: font('medium', 12, 16, {color: colors.onPrimary70}), // Medium 12/16 — 70% white
  balance: font('extraBold', 30, 36, {color: colors.textPrimary}), // ExtraBold 30/36 — #FFFFFF
  walletHint: font('medium', 10, 15, {color: colors.onPrimary50}), // Medium 10/15 — 50% white
  statLabel: font('medium', 10, 15, {
    color: colors.onPrimary60,
    textAlign: 'center',
  }), // Medium 10/15 — 60% white
  statValue: font('bold', 14, 20, {textAlign: 'center'}), // Bold 14/20 — colour varies

  /* --- Sections ------------------------------------------------------- */
  sectionTitle: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF
  link: font('medium', 12, 16, {color: colors.accent}), // Medium 12/16 — #4FC3F7

  /* --- Badges --------------------------------------------------------- */
  badge: font('semiBold', 10, 15, {color: colors.textPrimary}), // SemiBold 10/15 — #FFFFFF

  /* --- Live match card ------------------------------------------------ */
  liveTeam: font('semiBold', 12, 16, {color: colors.textPrimary}), // SemiBold 12/16 — #FFFFFF
  liveScore: font('bold', 14, 20, {color: colors.accent}), // Bold 14/20 — #4FC3F7
  liveOpponent: font('medium', 10, 15, {color: colors.textMuted}), // Medium 10/15 — #6B8AA0
  emojiSm: font('medium', 12, 16, {color: colors.textBright}), // Medium 12/16 — #F0F4FF
  emojiMd: font('regular', 14, 20, {color: colors.textBright}), // Regular 14/20 — #F0F4FF
  emojiXs: font('regular', 10, 15, {color: colors.textBright}), // Regular 10/15 — #F0F4FF

  /* --- Promo / referral ----------------------------------------------- */
  promoTitle: font('bold', 14, 20, {color: colors.gold}), // Bold 14/20 — #FFD54F
  promoHeadline: font('extraBold', 24, 30, {color: colors.textPrimary}), // ExtraBold 24/30 — #FFFFFF
  promoSub: font('medium', 12, 16, {color: colors.textMuted}), // Medium 12/16 — #6B8AA0
  promoTrophy: font('medium', 48, 48, {color: colors.textBright}), // Medium 48/48 — #F0F4FF
  cardTitle: font('semiBold', 14, 20, {color: colors.textPrimary}), // SemiBold 14/20 — #FFFFFF

  /* --- Match card ----------------------------------------------------- */
  league: font('medium', 11, 16.5, {color: colors.textMuted}), // Medium 11/16.5 — #6B8AA0
  kickoff: font('regular', 11, 16.5, {color: colors.textMuted}), // Regular 11/16.5 — #6B8AA0
  teamName: font('bold', 14, 20, {color: colors.textPrimary}), // Bold 14/20 — #FFFFFF
  score: font('extraBold', 20, 25, {color: colors.accent}), // ExtraBold 20/25 — #4FC3F7
  teamStatus: font('regular', 12, 16, {color: colors.textDim}), // Regular 12/16 — #4A6070
  versus: font('bold', 12, 16, {color: colors.textDim}), // Bold 12/16 — #4A6070
  overs: font('bold', 10, 15, {color: colors.live}), // Bold 10/15 — #FF3D71
  hint: font('regular', 10, 15, {color: colors.textDim}), // Regular 10/15 — #4A6070
  hintLink: font('medium', 10, 15, {color: colors.primary}), // Medium 10/15 — #1E88E5
  oddsLabel: font('semiBold', 9, 13.5, {
    color: colors.textMuted,
    letterSpacing: fontScale(0.225),
    textAlign: 'center',
  }), // SemiBold 9/13.5 — #6B8AA0, tracking 0.225, uppercase
  oddsValue: font('extraBold', 16, 16, {textAlign: 'center'}), // ExtraBold 16/16 — colour varies
  oddsTeam: font('medium', 9, 9, {
    color: colors.textDim,
    textAlign: 'center',
  }), // Medium 9/9 — #4A6070
  oddsPayout: font('medium', 8, 8, {
    color: colors.textDim,
    textAlign: 'center',
  }), // Medium 8/8 — #4A6070
  moreMarkets: font('semiBold', 11, 16.5, {color: colors.accent}), // SemiBold 11/16.5 — #4FC3F7

  /* --- Buttons -------------------------------------------------------- */
  buttonXl: font('bold', 16, 24, {textAlign: 'center'}), // Bold 16/24 — Login / Create Account
  buttonLg: font('semiBold', 14, 20, {textAlign: 'center'}), // SemiBold 14/20
  buttonSm: font('bold', 12, 16, {textAlign: 'center'}), // Bold 12/16

  /* --- Bottom nav ----------------------------------------------------- */
  navLabel: font('medium', 10, 15, {textAlign: 'center'}), // Medium 10/15
});
