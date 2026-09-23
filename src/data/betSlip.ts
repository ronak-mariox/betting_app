/** Copy transcribed from the Figma BetSlip frame (node 7:3760). */
export const betSlip = {
  league: 'IPL 2025 • Match 38',
  match: 'Mumbai Indians vs Chennai Super Kings',
  isLive: true,
  selection: 'Mumbai Indians',
  odds: 1.72,
  defaultStake: 500,
  /** Quick-stake amounts — label shown, value applied. */
  quickStakes: [
    {label: '₹100', value: 100},
    {label: '₹500', value: 500},
    {label: '₹1K', value: 1000},
    {label: '₹5K', value: 5000},
  ],
};

/** ₹12,450 → 12450, so the sheet can format and compare it. */
export const walletBalance = 12450;

export const formatRupees = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;
