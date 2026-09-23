/** Copy transcribed from the Figma ReferralScreen frame (node 9:92). */

export const referralHeader = {
  title: 'Refer & Earn',
  subtitle: 'Earn ₹250 per friend',
};

export const referralHero = {
  emoji: '🎁',
  titleLines: ['Invite Friends,', 'Earn Together!'],
  subtitle: 'Get ₹250 for every friend who joins & deposits',
  stats: [
    {label: 'Referrals', value: '4'},
    {label: 'Earned', value: '₹1,000'},
    {label: 'Per Invite', value: '₹250'},
  ],
};

export const referralCode = 'RAHUL2025';

/** What the share sheet and the WhatsApp/Telegram buttons send. */
export const referralMessage =
  `BetPro join karo mere code ${referralCode} se — ` +
  'signup par ₹50 bonus milega! https://betpro.app/r/' +
  referralCode;

export const shareTargets = [
  {id: 'whatsapp', emoji: '💬', label: 'WhatsApp', color: '#25D366'},
  {id: 'telegram', emoji: '✈️', label: 'Telegram', color: '#0088CC'},
  {id: 'link', emoji: '🔗', label: 'Share Link', color: '#1E88E5'},
  {id: 'copy', emoji: '📋', label: 'Copy', color: '#14253D'},
];

export const howItWorks = [
  {step: '1', title: 'Share your code', sub: 'Send your referral code to friends'},
  {step: '2', title: 'Friend signs up', sub: 'They register using your code'},
  {step: '3', title: 'Friend deposits', sub: 'They make their first deposit'},
  {step: '4', title: 'You earn ₹250', sub: 'Instantly credited to your wallet'},
];

export const referrals = [
  {id: 'r1', initial: 'A', name: 'Amit Sharma', date: 'Jul 10, 2025', amount: '+₹250'},
  {id: 'r2', initial: 'P', name: 'Priya Singh', date: 'Jul 8, 2025', amount: '+₹250'},
  {id: 'r3', initial: 'R', name: 'Ravi Verma', date: 'Jul 3, 2025', amount: '+₹250'},
  {id: 'r4', initial: 'S', name: 'Sneha Patel', date: 'Jun 25, 2025', amount: '+₹250'},
];

export const topReferrer = {
  emoji: '🏆',
  label: 'Top Referrer This Month',
  name: 'Vijay K. — 28 referrals',
  note: "You're #7. Refer 5 more to enter top 5!",
};
