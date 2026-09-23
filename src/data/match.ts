import {MatchStat} from '../components';

/** Copy transcribed from the Figma MatchScreen frame (node 7:3617). */

export const matchDetail = {
  league: 'IPL 2025 • Match 38',
  title: 'Mumbai Indians vs Chennai Super Kings',
  isLive: true,
  home: {name: 'Mumbai Indians', score: '186/4', meta: '15.1 Ov'},
  away: {name: 'Chennai Super Kings', score: '142/6'},
  markets: ['Match Winner', 'Top Batsman', 'Over/Under', 'Session'],
  odds: [
    {team: 'Indians', value: '1.72'},
    {team: 'Kings', value: '2.30'},
  ],
};

export const matchStats: MatchStat[] = [
  {label: 'Run Rate', home: '6.8', away: '5.9', homeWeight: 6.8, awayWeight: 5.9},
  {label: 'Boundaries', home: '18', away: '12', homeWeight: 18, awayWeight: 12},
  {label: 'Wickets', home: '4', away: '6', homeWeight: 4, awayWeight: 6},
];
