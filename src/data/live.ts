import {Match} from '../components';

/** Copy transcribed from the Figma LiveScreen frame (node 8:19). */

export const liveHeader = {
  title: 'Live Matches',
  subtitle: '4 matches in progress',
  emptyNote: 'More matches coming soon…',
};

export const liveFeed: Match[] = [
  {
    id: 'live-ipl-38',
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
    id: 'live-icc-day3',
    sport: '🏏',
    league: 'ICC Test • Day 3',
    isLive: true,
    overs: '14.3 Ov',
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
    id: 'live-icc-day3-b',
    sport: '🏏',
    league: 'ICC Test • Day 3',
    isLive: true,
    overs: '14.3 Ov',
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
    // Basketball has no overs, so the card falls back to the VS separator.
    id: 'live-nba',
    sport: '🏀',
    league: 'NBA Playoffs',
    isLive: true,
    home: {name: 'Boston Celtics', score: '98'},
    away: {name: 'Golden State', score: '91'},
    markets: [
      {
        label: 'HOME WIN',
        odds: '1.55',
        team: 'Celtics',
        payout: '₹100 → ₹155',
        accent: 'home',
      },
      {
        label: 'AWAY WIN',
        odds: '2.50',
        team: 'Golden State',
        payout: '₹100 → ₹250',
        accent: 'away',
      },
    ],
    extraMarkets: 18,
  },
];
