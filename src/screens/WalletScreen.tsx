import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BalanceCard,
  BottomNav,
  Button,
  Card,
  Icon,
  TransactionRow,
} from '../components';
import {transactions, walletSummary} from '../data/wallet';
import {colors, scale, spacing, type} from '../theme';

type WalletScreenProps = {
  /** Live wallet balance, already formatted. Falls back to the mock figure. */
  balance?: string;
  /** Only set when the screen is pushed, not reached from the tab bar. */
  onBack?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onChangeNav?: (key: string) => void;
};

/** Wallet — Figma node 8:512. */
export const WalletScreen = ({
  balance = walletSummary.balance,
  onBack,
  onDeposit,
  onWithdraw,
  onChangeNav,
}: WalletScreenProps) => {
  const insets = useSafeAreaInsets();
  const [balanceHidden, setBalanceHidden] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + spacing.xxl},
        ]}>
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
            balance={balanceHidden ? walletSummary.hiddenBalance : balance}
            meta={walletSummary.meta}
            balanceHidden={balanceHidden}
            onToggleVisibility={() => setBalanceHidden(current => !current)}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        </View>

        <View style={styles.tiles}>
          {walletSummary.tiles.map(tile => (
            <Card key={tile.id} style={styles.tile} contentStyle={styles.tilePad}>
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
