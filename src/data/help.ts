import {IconName} from '../components';
import {colors} from '../theme';

/**
 * Copy transcribed from the Figma Help & Support frames
 * (9:613 / 9:695 FAQs, 9:783 Contact Us, 9:889 Raise Ticket).
 */

export const helpHeader = {
  title: 'Help & Support',
  subtitle: "We're here 24/7",
};

export const helpTabs = ['FAQs', 'Contact Us', 'Raise Ticket'];

export const faqs = [
  {
    q: 'How do I deposit money?',
    a: 'Go to Wallet → Deposit. Choose your payment method (UPI, Net Banking, or Card) and enter the amount. Deposits are instant via UPI.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'Withdrawals are processed within 24 hours of request.',
  },
  {
    q: 'What is Cash Out?',
    a: 'Cash Out lets you settle a bet early for a guaranteed amount.',
  },
  {
    q: 'How does the referral program work?',
    a: 'Share your code from Profile → Refer a Friend. Friends who sign up with it join under the same agent as you.',
  },
  {
    q: 'Is my money safe?',
    a: 'Funds are held securely and protected with bank-grade encryption.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Security to update your password.',
  },
  {
    q: 'What sports can I bet on?',
    a: 'Cricket, football, tennis, basketball and more.',
  },
];

export type SupportChannel = {
  id: string;
  icon: IconName;
  title: string;
  detail: string;
  action: string;
  /** Opened by the row's button — tel: / mailto: / whatsapp:. */
  link: string;
  color: string;
  well: string;
};

export const supportChannels: SupportChannel[] = [
  {
    id: 'call',
    icon: 'supportCall',
    title: 'Call Support',
    detail: '+91 1800 123 4567 (Toll Free)',
    action: 'Call Now',
    link: 'tel:+9118001234567',
    color: colors.accent,
    well: 'rgba(79, 195, 247, 0.1)',
  },
  {
    id: 'email',
    icon: 'supportEmail',
    title: 'Email Support',
    detail: 'support@betpro.com',
    action: 'Send Email',
    link: 'mailto:support@betpro.com?subject=BetPro%20Support',
    color: colors.primary,
    well: 'rgba(30, 136, 229, 0.1)',
  },
  {
    id: 'whatsapp',
    icon: 'supportWhatsapp',
    title: 'WhatsApp',
    detail: '+91 98765 43210',
    action: 'Chat',
    link: 'whatsapp://send?phone=919876543210',
    color: '#25D366',
    well: 'rgba(37, 211, 102, 0.1)',
  },
];

export const supportHours = {
  label: 'Support Hours',
  value: '24 × 7 — All Days',
  note: 'Average response time: under 5 minutes',
};

export const ticketCategories = [
  'Deposit Issue',
  'Withdrawal Issue',
  'Bet Problem',
  'Account Issue',
  'Other',
];
