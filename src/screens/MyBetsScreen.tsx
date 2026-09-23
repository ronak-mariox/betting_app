import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Bet, BetCard, BottomNav, Button, Chip} from '../components';
import {bets as allBets} from '../data/myBets';
import {colors, scale, spacing, type} from '../theme';
import {CashOutSheet} from './CashOutSheet';

type MyBetsTab = 'open' | 'settled';

type MyBetsScreenProps = {
  activeNavKey?: string;
  /** Bets placed this session, newest first — they sit above the mock ones. */
  placedBets?: Bet[];
  /** Fires with the cashed-out bet so the wallet can be credited. */
  onCashOut?: (bet: Bet) => void;
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
  placedBets,
  onBack,
  onCashOut,
  onChangeNav,
}: MyBetsScreenProps) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<MyBetsTab>('open');
  const [bets, setBets] = useState<Bet[]>(() => [
    ...(placedBets ?? []),
    ...allBets,
  ]);
  const [cashingOut, setCashingOut] = useState<Bet | null>(null);

  const openBets = useMemo(() => bets.filter(b => b.status === 'open'), [bets]);
  const settledBets = useMemo(
    () => bets.filter(b => b.status !== 'open'),
    [bets],
  );
  const visible = tab === 'open' ? openBets : settledBets;

  /** Confirming removes the bet from Open — the 7:4747 state. */
  const confirmCashOut = (bet: Bet) => {
    setBets(current => current.filter(b => b.id !== bet.id));
    setCashingOut(null);
    onCashOut?.(bet);
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
            label="Settled"
            active={tab === 'settled'}
            onPress={() => setTab('settled')}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
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
});
