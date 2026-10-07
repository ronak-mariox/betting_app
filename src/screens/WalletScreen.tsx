import React, {useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BalanceCard,
  BottomNav,
  Button,
  Card,
  Icon,
  Transaction,
  TransactionRow,
} from '../components';
import {walletSummary} from '../data/wallet';
import type {PlayerWallet} from '../services/api';
import {rupees} from '../utils/feed';
import {colors, scale, spacing, type} from '../theme';

type WalletScreenProps = {
  /** The wallet as last fetched; null while loading. */
  wallet?: PlayerWallet | null;
  /** Ledger + pending requests, newest first. */
  transactions?: Transaction[];
  /** Pull-to-refresh — e.g. to see a deposit the agent just approved. */
  onRefresh?: () => Promise<void>;
  /** Only set when the screen is pushed, not reached from the tab bar. */
  onBack?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onChangeNav?: (key: string) => void;
};

/** Wallet — Figma node 8:512. */
export const WalletScreen = ({
  wallet,
  transactions = [],
  onRefresh,
  onBack,
  onDeposit,
  onWithdraw,
  onChangeNav,
}: WalletScreenProps) => {
  const insets = useSafeAreaInsets();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const tiles = [
    {
      id: 'total',
      icon: 'txnIn' as const,
      label: 'Total (incl. bets)',
      value: rupees(wallet?.balance ?? 0),
    },
    {
      id: 'inBets',
      icon: 'txnBet' as const,
      label: 'In Open Bets',
      value: rupees(wallet?.openStake ?? 0),
    },
  ];
  const meta = [
    `+${rupees(wallet?.wonToday ?? 0)} won today`,
    wallet?.pendingWithdrawal
      ? `${rupees(wallet.pendingWithdrawal)} withdrawal pending`
      : '',
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + spacing.xxl},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.textPrimary}
          />
        }>
        <View style={styles.titleRow}>
          {onBack ? (
            <Button
              variant="icon"
              icon="arrowLeft"
              onPress={onBack}
              accessibilityLabel="Go back"
            />
          ) : null}
          <Text style={type.pageTitle}>Wallet</Text>
        </View>

        <View style={styles.balanceWrap}>
          <BalanceCard
            balance={
              balanceHidden
                ? walletSummary.hiddenBalance
                : rupees(wallet?.available ?? 0)
            }
            meta={meta}
            balanceHidden={balanceHidden}
            onToggleVisibility={() => setBalanceHidden(current => !current)}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        </View>

        <View style={styles.tiles}>
          {tiles.map(tile => (
            <Card
              key={tile.id}
              style={styles.tile}
              contentStyle={styles.tilePad}>
              <Icon name={tile.icon} />
              <Text style={[type.tileLabel, styles.tileLabel]}>
                {tile.label}
              </Text>
              <Text style={type.tileValue}>{tile.value}</Text>
            </Card>
          ))}
        </View>

        <Text style={[type.cardTitle, styles.sectionTitle]}>
          Recent Transactions
        </Text>

        {transactions.length === 0 ? (
          <Text style={type.emptyNote}>Abhi koi transaction nahi hai</Text>
        ) : null}

        {transactions.map(transaction => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </ScrollView>

      <BottomNav activeKey="wallet" onChange={key => onChangeNav?.(key)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(24),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12 — same arrow-to-title gap as BackHeader
  },
  balanceWrap: {
    paddingTop: spacing.xl, // 16
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
    paddingTop: spacing.xl, // 16
  },
  tile: {
    flex: 1,
    height: scale(103.39),
  },
  tilePad: {
    flex: 1,
    padding: scale(16.701),
  },
  tileLabel: {
    paddingTop: spacing.md, // 8
  },
  sectionTitle: {
    paddingTop: spacing.xl, // 16
    paddingBottom: spacing.lg, // 12
  },
});
