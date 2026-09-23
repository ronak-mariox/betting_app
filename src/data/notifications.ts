/** Copy transcribed from the Figma NotificationsScreen frame (node 9:340). */

export type AppNotification = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  time: string;
  /** Unread items get the blue tint, border and dot. */
  unread: boolean;
};

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    emoji: '🏏',
    title: 'MIvCSK — Score Update',
    body: 'Mumbai Indians 186/4 in 18.2 overs',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 'n2',
    emoji: '💰',
    title: 'Deposit Successful',
    body: '₹5,000 credited to your wallet',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: 'n3',
    emoji: '🏆',
    title: 'Bet Won!',
    body: 'Man City bet — ₹725 credited',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'n4',
    emoji: '🎁',
    title: 'New Promotion',
    body: 'Get 50% bonus on next deposit!',
    time: 'Jul 13',
    unread: false,
  },
  {
    id: 'n5',
    emoji: '🔐',
    title: 'Login Alert',
    body: 'New login from Android device',
    time: 'Jul 12',
    unread: false,
  },
];
