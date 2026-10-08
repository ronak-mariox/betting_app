import {brand} from '../theme/brand';

/** Copy transcribed from the Figma SettingsScreen frame (node 9:451). */

export type NotificationSetting = {
  /** Key the switch is saved under on the account (backend: User.preferences). */
  id: string;
  label: string;
  sub: string;
};

export const notificationSettings: NotificationSetting[] = [
  {
    id: 'notifyLive',
    label: 'Live Bet Updates',
    sub: 'Match start & bet results',
  },
  {
    id: 'notifyMoney',
    label: 'Deposits & Withdrawals',
    sub: 'Transaction alerts',
  },
  {
    id: 'notifyPromos',
    label: 'Promotions & Offers',
    sub: 'Offers & announcements',
  },
  {
    id: 'notifySecurity',
    label: 'Security Alerts',
    sub: 'Login & security events',
  },
];

export const languages = ['English', 'Hindi'];

export const legalLinks = [
  {id: 'privacy', label: 'Privacy Policy'},
  {id: 'terms', label: 'Terms & Conditions'},
  {id: 'about', label: `About ${brand.name}`, value: 'v2.4.1'},
];
