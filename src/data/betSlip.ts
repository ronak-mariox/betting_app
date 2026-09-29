/** Copy transcribed from the Figma BetSlip frame (node 7:3760). */
export const betSlip = {
  defaultStake: 500,
  /** Quick-stake amounts — label shown, value applied. */
  quickStakes: [
    {label: '₹100', value: 100},
    {label: '₹500', value: 500},
    {label: '₹1K', value: 1000},
    {label: '₹5K', value: 5000},
  ],
};

export const formatRupees = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;
