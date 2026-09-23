/** Copy transcribed from the Figma SettingsScreen frame (node 9:451). */

export type NotificationSetting = {
  id: string;
  label: string;
  sub: string;
};

export const notificationSettings: NotificationSetting[] = [
  {id: 'live', label: 'Live Bet Updates', sub: 'Score & odds updates'},
  {
    id: 'money',
    label: 'Deposits & Withdrawals',
    sub: 'Transaction alerts',
  },
  {id: 'promos', label: 'Promotions & Offers', sub: 'Bonus & referral alerts'},
  {id: 'security', label: 'Security Alerts', sub: 'Login & security events'},
];

export const languages = ['English', 'Hindi'];

export const legalLinks = [
  {id: 'privacy', label: 'Privacy Policy'},
  {id: 'terms', label: 'Terms & Conditions'},
  {id: 'about', label: 'About BetPro', value: 'v2.4.1'},
];
