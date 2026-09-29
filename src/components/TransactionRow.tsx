import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Icon, IconName} from './Icon';

export type TransactionKind = 'credit' | 'debit';
export type TransactionState = 'success' | 'settled' | 'pending' | 'rejected';

export type Transaction = {
  id: string;
  icon: IconName;
  kind: TransactionKind;
  title: string;
  time: string;
  /** Formatted amount, e.g. "+₹5,000" or "₹1,000". */
  amount: string;
  state: TransactionState;
};

const stateColors: Record<TransactionState, {color: string; bg: string}> = {
  success: {color: colors.success, bg: colors.chipSuccess},
  settled: {color: colors.accent, bg: colors.chipAccent},
  pending: {color: colors.warning, bg: colors.chipWarning},
  rejected: {color: colors.danger, bg: colors.pillDanger},
};

type TransactionRowProps = {
  transaction: Transaction;
};

/** One line of the wallet's Recent Transactions list. */
export const TransactionRow = ({transaction}: TransactionRowProps) => {
  const isCredit = transaction.kind === 'credit';
  const state = stateColors[transaction.state];
  /** A rejected request never moved money, so its amount is greyed and struck out. */
  const rejected = transaction.state === 'rejected';

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.well,
          {
            backgroundColor: isCredit
              ? colors.wellSuccessSoft
              : colors.wellDangerSoft,
          },
        ]}>
        <Icon name={transaction.icon} />
      </View>

      <View style={styles.copy}>
        <Text style={type.txnTitle} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={[type.kickoff, styles.time]} numberOfLines={2}>
          {transaction.time}
        </Text>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            type.txnAmount,
            {color: isCredit ? colors.success : colors.danger},
            rejected && styles.rejectedAmount,
          ]}>
          {transaction.amount}
        </Text>
        <View style={[styles.stateChip, {backgroundColor: state.bg}]}>
          <Text style={[type.txnStatus, {color: state.color}]}>
            {transaction.state}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rejectedAmount: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingTop: spacing.lg, // 12
    paddingBottom: scale(12.701),
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderTile,
  },
  well: {
    width: scale(39.994),
    height: scale(39.994),
    borderRadius: radius.sm, // 14
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  time: {
    paddingTop: spacing.xxs, // 2
  },
  right: {
    alignItems: 'flex-end',
  },
  stateChip: {
    marginTop: spacing.xs, // 4
    paddingHorizontal: spacing.md, // 8
    paddingVertical: scale(1.5),
    borderRadius: radius.pill,
  },
});
