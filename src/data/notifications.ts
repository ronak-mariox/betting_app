/** A row on the Notifications screen (Figma node 9:340); the rows themselves come from the backend. */
export type AppNotification = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  time: string;
  /** Unread items get the blue tint, border and dot. */
  unread: boolean;
  /** Screen the row opens when tapped, or '' for none. */
  link: '' | 'wallet' | 'bets' | 'live' | 'kyc' | 'profile';
};
