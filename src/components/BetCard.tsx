import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Badge} from './Badge';
import {Card} from './Card';

export type BetStatus = 'open' | 'won' | 'lost' | 'cashed';

export type Bet = {
  id: string;
  /** Reference shown top-left — "BET001"; defaults to `id`. */
  reference?: string;
  status: BetStatus;
  match: string;
  selection: string;
  /** Market the bet is on ("Match Odds", "Bookmaker"): tells two bets on one match apart. */
  market?: string;
  odds: number;
  stake: number;
  /** Early-settlement offer; open bets only. */
  cashOut?: number;
  /** Amount returned once settled (0 for a loss). */
  payout?: number;
};

/** Pill label, pill colours and the "Potential" figure colour, per status. */
export const statusStyles: Record<
  BetStatus,
  {label: string; color: string; backgroundColor: string}
> = {
  open: {
    label: 'Open',
    color: colors.warning,
    backgroundColor: colors.pillOpen,
  },
  won: {label: 'Won ✓', color: colors.success, backgroundColor: colors.pillWon},
  lost: {
    label: 'Lost ✗',
    color: colors.danger,
    backgroundColor: colors.pillLost,
  },
  cashed: {
    label: 'Cashed Out',
    color: colors.accent,
    backgroundColor: colors.chipAccent,
  },
};

/** Potential return — stake × odds while open, the actual return once settled. */
export const potentialWin = (bet: Bet): number =>
  bet.status === 'open' || bet.payout === undefined
    ? bet.stake * bet.odds
    : bet.payout;

const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

type BetCardProps = {
  bet: Bet;
  /** Renders the outlined cash-out button; open bets only. */
  onCashOut?: (bet: Bet) => void;
};

/** One row of the My Bets list — used by both the Open and Settled tabs. */
export const BetCard = ({bet, onCashOut}: BetCardProps) => {
  const status = statusStyles[bet.status];
  const showCashOut = bet.status === 'open' && bet.cashOut !== undefined;

  const stats = [
    {label: 'Odds', value: bet.odds.toFixed(2), color: colors.textPrimary},
    {label: 'Stake', value: rupees(bet.stake), color: colors.textPrimary},
    {
      label: bet.status === 'open' ? 'Potential' : 'Return',
      value: rupees(potentialWin(bet)),
      color: status.color,
    },
  ];

  return (
    <Card contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={type.league}>{bet.reference ?? bet.id}</Text>
        <Badge
          variant="status"
          label={status.label}
          color={status.color}
          backgroundColor={status.backgroundColor}
        />
      </View>

      <Text style={[type.matchTitle, styles.match]}>{bet.match}</Text>

      <Text style={[type.selectionLabel, styles.selection]}>
        Selection: <Text style={type.selectionName}>{bet.selection}</Text>
        {bet.market ? ` • ${bet.market}` : ''}
      </Text>

      <View style={styles.stats}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.stat}>
            <Text style={type.betStatLabel}>{stat.label}</Text>
            <Text style={[type.betStatValue, {color: stat.color}]}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {showCashOut ? (
        <Pressable
          onPress={() => onCashOut?.(bet)}
          accessibilityRole="button"
          accessibilityLabel={`Cash out ${bet.reference ?? bet.id} for ${rupees(bet.cashOut!)}`}
          android_ripple={{color: colors.borderOdds}}
          style={({pressed}) => [styles.cashOut, pressed && styles.pressed]}>
          <Text style={type.cashOutLabel}>
            {`💰 Cash Out — ${rupees(bet.cashOut!)}`}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: scale(16.701),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  match: {
    paddingTop: spacing.md, // 8
  },
  selection: {
    paddingTop: spacing.xs, // 4
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    marginTop: spacing.lg, // 12
    paddingTop: scale(12.701),
    borderTopWidth: hairline,
    borderTopColor: colors.borderCard,
  },
  stat: {
    flex: 1, // three equal 102.87 columns
  },
  cashOut: {
    height: scale(37.399),
    marginTop: spacing.lg, // 12
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm, // 14
    backgroundColor: colors.cashOutBg,
    borderWidth: hairline,
    borderColor: colors.gold,
  },
  pressed: {
    opacity: 0.75,
  },
});
