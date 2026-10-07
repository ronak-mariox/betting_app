import {PaymentMethod} from '../components';

/**
 * Copy transcribed from the Figma Deposit frames
 * (8:749 amount + method, 8:896 pay, 8:1045 submitted).
 */

export const depositHeader = {
  title: 'Deposit',
  subtitle: 'Add money to your wallet',
};

export const quickAmounts = [
  {label: '₹500', value: 500},
  {label: '₹1K', value: 1000},
  {label: '₹2K', value: 2000},
  {label: '₹5K', value: 5000},
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    subtitle: 'Instant transfer',
    logo: require('../assets/images/phonepe.png'),
    tag: 'Popular',
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    subtitle: 'Instant transfer',
    logo: require('../assets/images/gpay.png'),
    tag: 'Instant',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    subtitle: 'All UPI apps',
    logo: require('../assets/images/bhim.png'),
  },
  {
    id: 'paytm',
    name: 'Paytm',
    subtitle: 'Wallet & UPI',
    logo: require('../assets/images/paytm.png'),
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    subtitle: 'All major banks',
    icon: 'netbanking',
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: 'card',
  },
];

export const upiId = 'betpro@upi';
export const qrImage = require('../assets/images/deposit-qr.png');

/** The payment-screenshot slot on the pay step. */
export const paymentProof = {
  label: 'Payment Screenshot',
  title: 'Payment ka Screenshot',
  hint: 'JPG ya PNG • Max 5MB',
  cta: 'Upload Karo',
  uploaded: 'Upload ho gaya ✓',
  help: 'Payment successful wali screen ka screenshot lagao, jisme amount aur Transaction ID dikhe',
  missing: 'Payment ka screenshot lagana zaroori hai',
};

/** Minimum deposit, enforced by the step-1 CTA. */
export const minDeposit = 100;
