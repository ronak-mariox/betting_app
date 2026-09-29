import type {
  Bet,
  LiveMatch,
  Match,
  Transaction,
  WalletStat,
} from '../components';
import type {AppNotification} from '../data/notifications';
import type {
  ApiBet,
  ApiMatch,
  PlayerNotification,
  PlayerTransaction,
  PlayerWalletRequest,
} from '../services/api';
import {colors} from '../theme';

export const rupees = (amount: number) =>
  `₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;

/** "Mumbai Indians" -> "Indians": the odds buttons show the last word, as in the design. */
const shortName = (team: string) => team.split(' ').slice(-1)[0] || team;

/** "142/3 (16.2)" -> {score: "142/3", overs: "16.2 Ov"}; anything else passes through. */
export const splitScore = (score: string) => {
  const match = /^(.*?)\s*\((\d+(?:\.\d+)?)\)\s*$/.exec(score || '');
  return match
    ? {score: match[1], overs: `${match[2]} Ov`}
    : {score, overs: undefined};
};

export const kickoff = (iso: string) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  if (date.toDateString() === today.toDateString()) {
    return `Today ${time}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${time}`;
  }
  return `${date.getDate()}/${date.getMonth() + 1} ${time}`;
};

/** A feed match as the Home/Live card expects: the first market's first two selections. */
export function toMatchCard(match: ApiMatch): Match {
  const isLive = match.status === 'Live';
  const {score, overs} = splitScore(match.score);
  const market = match.markets[0];
  const [home, away] = market.runners;
  const button = (
    runner: typeof home,
    label: string,
    accent: 'home' | 'away',
  ) => ({
    label,
    odds: runner.odds.toFixed(2),
    team: shortName(runner.name),
    payout: `₹100 → ₹${Math.round(100 * runner.odds)}`,
    accent,
  });
  return {
    id: match._id,
    sport: match.emoji || '🏟️',
    league: match.league,
    isLive,
    overs: isLive ? overs : undefined,
    kickoff: isLive ? undefined : kickoff(match.startTime),
    home: {name: match.home, score: isLive ? score : undefined},
    away: {name: match.away},
    markets: [
      button(home, 'HOME WIN', 'home'),
      button(away ?? home, 'AWAY WIN', 'away'),
    ],
    extraMarkets: Math.max(0, match.markets.length - 1),
  };
}

export function toLiveMatch(match: ApiMatch): LiveMatch {
  return {
    id: match._id,
    sport: match.emoji || '🏟️',
    team: match.home,
    score: splitScore(match.score).score || '—',
    opponent: match.away,
  };
}

export function toBet(bet: ApiBet): Bet {
  const status =
    bet.status === 'Pending'
      ? 'open'
      : bet.status === 'Won'
        ? 'won'
        : bet.status === 'Cashed Out'
          ? 'cashed'
          : 'lost';
  return {
    id: bet._id,
    reference: `BET${bet._id.slice(-6).toUpperCase()}`,
    status,
    match: bet.match,
    selection: bet.selection,
    market: bet.market || undefined,
    odds: bet.odds,
    stake: bet.stake,
    payout: bet.payout,
    cashOut: bet.cashOut ?? undefined,
  };
}

const isToday = (iso: string | null) =>
  Boolean(iso) && new Date(iso!).toDateString() === new Date().toDateString();

/** Home wallet card: bets placed today, and today's settled wins / losses. */
export function todayStats(bets: ApiBet[]): WalletStat[] {
  const placed = bets.filter(b => isToday(b.placedAt)).length;
  const settledToday = bets.filter(b => isToday(b.settledAt));
  const net = settledToday.map(b => b.payout - b.stake);
  const wins = net.filter(n => n > 0).reduce((a, b) => a + b, 0);
  const losses = net.filter(n => n < 0).reduce((a, b) => a + b, 0);
  return [
    {label: "Today's Bets", value: String(placed)},
    {label: 'Wins', value: `+${rupees(wins)}`, color: colors.success},
    {label: 'Losses', value: `-${rupees(losses)}`, color: colors.danger},
  ];
}

const when = (iso: string) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (isToday(iso)) {
    return `Today ${time}`;
  }
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${time}`;
  }
  return date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
};

/**
 * Wallet history rows: completed ledger entries plus deposit / withdrawal
 * requests still waiting for the agent (or rejected), newest first.
 */
export function toWalletRows(
  transactions: PlayerTransaction[],
  requests: PlayerWalletRequest[],
): Transaction[] {
  const TITLES: Record<PlayerTransaction['type'], string> = {
    Deposit: 'Deposit',
    Withdrawal: 'Withdrawal',
    'Bet Win': 'Bet Won',
    'Bet Loss': 'Bet Lost',
    Adjustment: 'Adjustment',
    Commission: 'Commission',
    Payment: 'Payment',
  };
  /** "Cash out — Mumbai Indians" / "MI vs CSK — Match Odds: MI" -> what the bet was on. */
  const betTitle = (txn: PlayerTransaction) => {
    const cashOut = /^Cash out — (.+)$/.exec(txn.note);
    if (cashOut) {
      return `Cash Out • ${cashOut[1]}`;
    }
    const match = txn.note.split(' — ')[0];
    return [TITLES[txn.type], match].filter(Boolean).join(' • ');
  };
  const isBet = (txn: PlayerTransaction) =>
    txn.type === 'Bet Win' || txn.type === 'Bet Loss';
  const ledger = transactions.map(txn => ({
    at: txn.createdAt,
    row: {
      id: txn._id,
      icon:
        txn.type === 'Bet Win'
          ? ('txnWin' as const)
          : txn.type === 'Bet Loss'
            ? ('txnBet' as const)
            : txn.amount >= 0
              ? ('txnIn' as const)
              : ('txnOut' as const),
      kind: txn.amount >= 0 ? ('credit' as const) : ('debit' as const),
      title: isBet(txn)
        ? betTitle(txn)
        : [TITLES[txn.type], txn.method].filter(Boolean).join(' • '),
      time: when(txn.createdAt),
      amount: `${txn.amount >= 0 ? '+' : '-'}${rupees(txn.amount)}`,
      state:
        txn.status === 'Pending' ? ('pending' as const) : ('success' as const),
    },
  }));
  const open = requests
    .filter(r => r.status !== 'Approved')
    .map(r => ({
      at: r.createdAt,
      row: {
        id: r._id,
        icon: r.kind === 'deposit' ? ('txnIn' as const) : ('txnOut' as const),
        kind: r.kind === 'deposit' ? ('credit' as const) : ('debit' as const),
        title: `${r.kind === 'deposit' ? 'Deposit' : 'Withdrawal'} ${
          r.status === 'Rejected' ? 'rejected' : 'request'
        }${r.method ? ` • ${r.method}` : ''}`,
        // A rejection's reason replaces the time — it's what the player needs to act on.
        time:
          r.status === 'Rejected' && r.rejectionReason
            ? `Reason: ${r.rejectionReason}`
            : when(r.createdAt),
        amount: `${r.kind === 'deposit' ? '+' : ''}${rupees(r.amount)}`,
        state:
          r.status === 'Rejected'
            ? ('rejected' as const)
            : ('pending' as const),
      },
    }));
  return [...ledger, ...open]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .map(item => item.row);
}

/** Profile header figures: all bets, bets won (incl. profitable cash-outs), win rate of settled ones. */
export function profileStats(bets: ApiBet[]) {
  const settled = bets.filter(
    b => b.status !== 'Pending' && b.status !== 'Void',
  );
  const won = settled.filter(b => b.payout > b.stake).length;
  return [
    {label: 'Total Bets', value: String(bets.length)},
    {label: 'Won', value: String(won)},
    {
      label: 'Win Rate',
      value: settled.length
        ? `${((won / settled.length) * 100).toFixed(1)}%`
        : '—',
    },
  ];
}

/** "Good morning 👋" / afternoon / evening, by the device clock. */
export function greeting(date = new Date()) {
  const hour = date.getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${part} 👋`;
}

/** "Just now", "2 min ago", "1 hr ago", "Yesterday", "13 Jul" — as on the Notifications frame. */
export function timeAgo(iso: string, now = new Date()) {
  const date = new Date(iso);
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  if (date.toDateString() === now.toDateString()) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  }
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
}

export function toNotification(
  row: PlayerNotification,
  now = new Date(),
): AppNotification {
  return {
    id: row._id,
    emoji: row.emoji,
    title: row.title,
    body: row.body,
    time: timeAgo(row.createdAt, now),
    unread: row.unread,
    link: row.link,
  };
}
