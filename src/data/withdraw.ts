import {ToggleOption} from '../components';

/**
 * Copy transcribed from the Figma Withdraw frames
 * (8:1112 amount + method, 8:1218 confirm, 8:1280 requested).
 */

export const withdrawHeader = {
  title: 'Withdraw',
  /**
   * The Withdraw frames print ₹14,282 while the Wallet frame (8:512) shows a
   * ₹13,282 total balance. Kept as authored rather than reconciled.
   */
  available: 14282,
};

export const withdrawMethods: ToggleOption[] = [
  {id: 'upi', label: 'UPI / Wallet', icon: 'smartphone'},
  {id: 'bank', label: 'Bank Transfer', icon: 'bank'},
];

export const quickAmounts = [
  {label: '₹500', value: 500},
  {label: '₹1K', value: 1000},
  {label: '₹2K', value: 2000},
  {label: '₹5K', value: 5000},
];

/** Logos shown under the UPI ID field — same exports as the deposit screen. */
export const upiLogos = [
  require('../assets/images/phonepe.png'),
  require('../assets/images/gpay.png'),
  require('../assets/images/bhim.png'),
  require('../assets/images/paytm.png'),
];

export const withdrawCopy = {
  upiLabel: 'UPI ID',
  upiPlaceholder: 'yourname@upi',
  upiHelper: 'Enter your PhonePe, GPay, Paytm or any UPI ID',
  warning:
    '⚠️ Withdrawals are processed within 24 hours. Minimum withdrawal is ₹500.',
  processingTime: 'Within 24 hours',
};

/** Minimum withdrawal, enforced by the step-1 CTA. */
export const minWithdrawal = 500;
