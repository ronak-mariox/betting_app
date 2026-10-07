import {MenuItem} from '../components';
import {colors} from '../theme';

/** Copy transcribed from the Figma ProfileScreen frame (node 8:1346). */

export const profile = {
  initials: 'RK',
  name: 'Rahul Kumar',
  phone: '+91 98765 43210',
  referralCode: 'RAHUL2025',
  stats: [
    {label: 'Total Bets', value: '0'},
    {label: 'Won', value: '0'},
    {label: 'Win Rate', value: '—'},
  ],
};

export const profileMenu: MenuItem[] = [
  {id: 'edit', icon: 'menuEdit', label: 'Edit Profile'},
  // Opens the KYC flow, or its status once submitted.
  {
    id: 'kyc',
    icon: 'kycShieldSm',
    label: 'KYC Verification',
    iconColor: colors.accent,
  },
  {id: 'bets', icon: 'menuBets', label: 'My Bets'},
  {id: 'wallet', icon: 'menuWallet', label: 'Wallet'},
  {
    id: 'referral',
    icon: 'menuRefer',
    label: 'Refer a Friend',
    wellColor: colors.wellMenuSuccess,
  },
  {id: 'notifications', icon: 'menuBell', label: 'Notifications'},
  {
    id: 'help',
    icon: 'menuHelp',
    label: 'Help & Support',
    wellColor: colors.wellMenuGold,
  },
  {id: 'settings', icon: 'menuSettings', label: 'Settings'},
];

/**
 * Editable fields — Figma EditProfileScreen (node 9:2). `value` is only the
 * placeholder shown when EditProfileScreen is used without real
 * `initialValues` (e.g. before a session loads) — the screen's real values
 * come from the signed-in player's account.
 */
export const editProfileFields = [
  {id: 'name', label: 'Full Name', value: ''},
  {
    id: 'email',
    label: 'Email Address',
    value: '',
    keyboardType: 'email-address' as const,
  },
  {id: 'dob', label: 'Date of Birth', value: ''},
  {id: 'city', label: 'City', value: ''},
];

/** Logout confirmation — Figma node 9:1070. */
export const logoutSheet = {
  title: 'Log Out?',
  body: "You'll need to sign in again to continue",
  cancel: 'Cancel',
  confirm: 'Logout',
};
