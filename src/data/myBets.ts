import {Bet} from '../components';

/**
 * Copy transcribed from the Figma My Bets frames
 * (7:4096 Open, 7:4313 Settled, 7:4747 Open after cash-out).
 * Every "Potential" figure in those frames equals stake × odds, so it's derived
 * rather than duplicated here.
 */
export const bets: Bet[] = [
  {
    id: 'BET001',
    status: 'open',
    match: 'Mumbai Indians vs Chennai Super Kings',
    selection: 'Mumbai Indians',
    odds: 1.85,
    stake: 1000,
    cashOut: 1332,
  },
  {
    id: 'BET004',
    status: 'open',
    match: 'Djokovic vs Alcaraz',
    selection: 'N. Djokovic',
    odds: 1.6,
    stake: 2000,
    cashOut: 2304,
  },
  {
    id: 'BET005',
    status: 'open',
    match: 'India vs England',
    selection: 'India',
    odds: 1.25,
    stake: 5000,
    cashOut: 4500,
  },
  {
    id: 'BET002',
    status: 'won',
    match: 'Man City vs Arsenal',
    selection: 'Manchester City',
    odds: 1.45,
    stake: 500,
  },
  {
    id: 'BET003',
    status: 'lost',
    match: 'Real Madrid vs Barcelona',
    selection: 'Draw',
    odds: 3.4,
    stake: 300,
  },
];
