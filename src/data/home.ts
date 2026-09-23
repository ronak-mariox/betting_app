import {LiveMatch, Match, WalletStat} from '../components';
import {colors} from '../theme';

/** Content transcribed from the Figma HomeScreen frame. */

export const user = {
  greeting: 'Good evening 👋',
  name: 'Rahul Kumar',
};

export const wallet = {
  balance: '₹12,450',
  /** Shown while the eye toggle hides the amount. */
  hiddenBalance: '₹ • • • • •',
  hint: 'Tap to view wallet →',
};

export const walletStats: WalletStat[] = [
  {label: "Today's Bets", value: '3'},
  {label: 'Wins', value: '+₹725', color: colors.success},
  {label: 'Losses', value: '-₹300', color: colors.danger},
];

/** Counter shown in the "Live Now" pill (the design's own number). */
export const liveCount = 4;

export const liveMatches: LiveMatch[] = [
  {
    id: 'live-1',
    sport: '🏏',
    team: 'Mumbai Indians',
    score: '186/4',
    opponent: 'Chennai Super Kings',
  },
  {
    id: 'live-2',
    sport: '🏏',
    team: 'Mumbai Indians',
    score: '186/4',
    opponent: 'Chennai Super Kings',
  },
  {
    id: 'live-3',
    sport: '⚽',
    team: 'Manchester City',
    score: '2',
    opponent: 'Arsenal',
  },
  {id: 'live-4', sport: '🏏', team: 'India', score: '387/6', opponent: 'England'},
  {
    id: 'live-5',
    sport: '🏀',
    team: 'Boston Celtics',
    score: '98',
    opponent: 'Golden State',
  },
];

export const matches: Match[] = [
  {
    id: 'match-1',
    sport: '🏏',
    league: 'IPL 2025 • Match 38',
    isLive: true,
    overs: '15.1 Ov',
    starred: true,
    home: {name: 'Mumbai Indians', score: '186/4'},
    away: {name: 'Chennai Super Kings', score: '142/6'},
    markets: [
      {
        label: 'HOME WIN',
        odds: '1.72',
        team: 'Indians',
        payout: '₹100 → ₹172',
        accent: 'home',
      },
      {
        label: 'AWAY WIN',
        odds: '2.30',
        team: 'Kings',
        payout: '₹100 → ₹230',
        accent: 'away',
      },
    ],
    extraMarkets: 24,
  },
  {
    id: 'match-2',
    sport: '🏏',
    league: 'ICC Test • Day 3',
    isLive: true,
    overs: '14.3 Ov',
    starred: false,
    home: {name: 'India', score: '387/6'},
    away: {name: 'England', score: '234 & 45/2'},
    markets: [
      {
        label: 'HOME WIN',
        odds: '1.25',
        team: 'India',
        payout: '₹100 → ₹125',
        accent: 'home',
      },
      {
        label: 'AWAY WIN',
        odds: '4.00',
        team: 'England',
        payout: '₹100 → ₹400',
        accent: 'away',
      },
    ],
    extraMarkets: 24,
  },
  {
    id: 'match-3',
    sport: '🏏',
    league: 'IPL 2025 • Match 39',
    isLive: false,
    kickoff: 'Today 7:30 PM',
    statusLabel: 'Upcoming',
    starred: false,
    home: {name: 'Royal Challengers'},
    away: {name: 'Kolkata Knight'},
    markets: [
      {
        label: 'HOME WIN',
        odds: '2.10',
        team: 'Challengers',
        payout: '₹100 → ₹210',
        accent: 'home',
      },
      {
        label: 'AWAY WIN',
        odds: '1.80',
        team: 'Riders',
        payout: '₹100 → ₹180',
        accent: 'away',
      },
    ],
    extraMarkets: 24,
  },
];

/** Trending queries in the search overlay (Figma node 9:2504). */
export const searchSuggestions = [
  'IPL 2025',
  'Premier League',
  'India vs England',
  'Wimbledon',
];

export const promo = {
  title: '🎁 Welcome Bonus',
  headline: '100%',
  subtitle: 'on first deposit up to ₹10,000',
  ctaLabel: 'Claim Now',
  emoji: '🏆',
};

export const referral = {
  title: 'Invite Friends',
  subtitle: 'Earn ₹250 per referral',
  ctaLabel: 'Invite',
};
