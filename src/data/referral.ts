import {brand} from '../theme/brand';

/** Copy transcribed from the Figma ReferralScreen frame (node 9:92). */

export const referralHeader = {
  title: 'Refer a Friend',
  subtitle: 'Invite friends with your code',
};

export const referralHero = {
  emoji: '🎁',
  titleLines: ['Invite Friends,', 'Play Together!'],
  subtitle: 'Friends who sign up with your code join under your agent',
};

/** What the share sheet and the WhatsApp/Telegram buttons send. */
export const referralMessage = (referralCode: string) =>
  `${brand.name} join karo mere code ${referralCode} se — ` +
  'https://betpro.app/r/' +
  referralCode;

export const shareTargets = [
  {id: 'whatsapp', emoji: '💬', label: 'WhatsApp', color: '#25D366'},
  {id: 'telegram', emoji: '✈️', label: 'Telegram', color: '#0088CC'},
  {id: 'link', emoji: '🔗', label: 'Share Link', color: '#1E88E5'},
  {id: 'copy', emoji: '📋', label: 'Copy', color: '#14253D'},
];

export const howItWorks = [
  {
    step: '1',
    title: 'Share your code',
    sub: 'Send your referral code to friends',
  },
  {step: '2', title: 'Friend signs up', sub: 'They register using your code'},
  {
    step: '3',
    title: 'Play together',
    sub: 'They are placed with the same agent as you',
  },
];
