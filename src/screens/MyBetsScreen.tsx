import React, {useMemo, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Bet, BetCard, BottomNav, Button, Chip} from '../components';
import {colors, scale, spacing, type} from '../theme';
import {CashOutSheet} from './CashOutSheet';

type MyBetsTab = 'open' | 'settled';

type MyBetsScreenProps = {
  activeNavKey?: string;
  /** The player's bets from the backend, newest first. */
  bets?: Bet[];
  /** Cashes the bet out on the backend; resolves true once it's done. */
  onCashOut?: (bet: Bet) => Promise<boolean>;
  /** Pull-to-refresh: refetches bets (cash-out offers follow the odds). */
  onRefresh?: () => Promise<void>;
  /** Only set when the screen is pushed, not reached from the tab bar. */
  onBack?: () => void;
  onChangeNav?: (key: string) => void;
};

/**
 * My Bets — Figma nodes 7:4096 (Open), 7:4313 (Settled) and 7:4747, which is
 * the Open tab after a bet has been cashed out. Cashing out settles the bet
 * locally, so the tab count drops 3 → 2 exactly as that frame shows.
 */
export const MyBetsScreen = ({
  activeNavKey = 'bets',
  bets = [],
  onBack,
  onCashOut,
  onRefresh,
  onChangeNav,
}: MyBetsScreenProps) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<MyBetsTab>('open');
  const [refreshing, setRefreshing] = useState(false);
  const [cashingOut, setCashingOut] = useState<Bet | null>(null);

  const openBets = useMemo(() => bets.filter(b => b.status === 'open'), [bets]);
  const settledBets = useMemo(
    () => bets.filter(b => b.status !== 'open'),
    [bets],
  );
  const visible = tab === 'open' ? openBets : settledBets;

  /** Confirming settles the bet on the backend; the refetch moves it to Settled — the 7:4747 state. */
  const confirmCashOut = async (bet: Bet) => {
    setCashingOut(null);
    await onCashOut?.(bet);
  };

  const refresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.xxl}]}>
        <View style={styles.titleRow}>
          {onBack ? (
            <Button
              variant="icon"
              icon="arrowLeft"
              onPress={onBack}
              accessibilityLabel="Go back"
            />
          ) : null}
          <Text style={type.pageTitle}>My Bets</Text>
        </View>

        <View style={styles.tabs}>
          <Chip
            tone="segment"
            label={`Open (${openBets.length})`}
            active={tab === 'open'}
            onPress={() => setTab('open')}
          />
          <Chip
            tone="segment"
            label={`Settled (${settledBets.length})`}
            active={tab === 'settled'}
            onPress={() => setTab('settled')}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.textPrimary}
          />
        }>
        {visible.length === 0 ? (
          <Text style={[type.emptyNote, styles.empty]}>
            {tab === 'open'
              ? 'Koi open bet nahi hai — Home se match choose karo'
              : 'Abhi tak koi bet settle nahi hui'}
          </Text>
        ) : null}
        {visible.map((bet, index) => (
          <View key={bet.id} style={index > 0 && styles.spacing}>
            <BetCard bet={bet} onCashOut={setCashingOut} />
          </View>
        ))}
      </ScrollView>

      <CashOutSheet
        bet={cashingOut}
        onClose={() => setCashingOut(null)}
        onConfirm={confirmCashOut}
      />

      <BottomNav
        activeKey={activeNavKey}
        onChange={key => onChangeNav?.(key)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  header: {
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.xl, // 16
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12 — same arrow-to-title gap as BackHeader
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.xl, // 16
  },
  list: {
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(24),
  },
  spacing: {
    paddingTop: spacing.lg, // 12
  },
  empty: {
    paddingVertical: scale(32),
  },
});
