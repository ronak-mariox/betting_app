import {Transaction} from '../components';

/** Copy transcribed from the Figma WalletScreen frame (node 8:512). */

export const walletSummary = {
  balance: '₹13,282',
  /** Shown while the eye toggle hides the amount. */
  hiddenBalance: '₹ • • • • •',
  meta: '+₹725 won today',
  tiles: [
    {id: 'bonus', icon: 'gift' as const, label: 'Bonus', value: '₹500'},
    {
      id: 'referral',
      icon: 'referral' as const,
      label: 'Referral',
      value: '₹1,000',
    },
  ],
};

export const transactions: Transaction[] = [
  {
    id: 't1',
    icon: 'txnIn',
    kind: 'credit',
    title: 'UPI Deposit',
    time: 'Today 2:14 PM',
    amount: '+₹5,000',
    state: 'success',
  },
  {
    id: 't2',
    icon: 'txnBet',
    kind: 'debit',
    title: 'Bet • MIvCSK',
    time: 'Today 1:30 PM',
    amount: '₹1,000',
    state: 'settled',
  },
  {
    id: 't3',
    icon: 'txnWin',
    kind: 'credit',
    title: 'Win • ManCity',
    time: 'Yesterday',
    amount: '+₹725',
    state: 'settled',
  },
  {
    id: 't4',
    icon: 'txnOut',
    kind: 'debit',
    title: 'Bank Withdrawal',
    time: 'Jul 12',
    amount: '₹2,000',
    state: 'pending',
  },
  {
    id: 't5',
    icon: 'txnIn',
    kind: 'credit',
    title: 'UPI Deposit',
    time: 'Jul 11',
    amount: '+₹3,000',
    state: 'success',
  },
];
