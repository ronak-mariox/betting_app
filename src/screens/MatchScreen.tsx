import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Badge,
  Button,
  Card,
  ChipBar,
  InfoCallout,
  MatchMedia,
  Scoreboard,
} from '../components';
import type {ApiMatch, ApiRunner} from '../services/api';
import {kickoff, rupees, splitScore} from '../utils/feed';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {BetSlipSheet} from './BetSlipSheet';

type MatchScreenProps = {
  /** The match as last fetched; the screen shows an empty state while it's missing. */
  match?: ApiMatch | null;
  onBack?: () => void;
  /** Available balance in rupees (wallet minus open stakes); the slip gates the stake on it. */
  balance?: number;
  /** Betting is open only to players whose KYC is verified. */
  kycVerified?: boolean;
  /** The KYC note (shown while unverified) opens the player's KYC screen. */
  onOpenKyc?: () => void;
  /** Places the bet on the backend; resolves true once it's accepted. */
  onPlaceBet?: (bet: {
    marketId: string;
    selection: string;
    stake: number;
  }) => Promise<boolean>;
};

/** Match detail — Figma node 7:3617. Tapping an odds button opens the bet slip. */
export const MatchScreen = ({
  match,
  onBack,
  balance = 0,
  kycVerified = true,
  onOpenKyc,
  onPlaceBet,
}: MatchScreenProps) => {
  const insets = useSafeAreaInsets();
  const markets = match?.markets ?? [];
  // Fancy propositions ("IND Will Win Toss", …) can run to dozens, so they share one tab.
  const fancy = markets.filter(m => m.type === 'Fancy');
  const fancyTab = fancy.length ? `Fancy (${fancy.length})` : null;
  const tabs = [
    ...markets.filter(m => m.type !== 'Fancy').map(m => m.name),
    ...(fancyTab ? [fancyTab] : []),
  ];
  const [tab, setTab] = useState(tabs[0] ?? '');
  const activeTab = tabs.includes(tab) ? tab : tabs[0] ?? '';
  const showFancy = activeTab === fancyTab;
  const market = showFancy
    ? undefined
    : markets.find(m => m.name === activeTab) ?? markets[0];
  /** The odds button that opened the slip — null while it's closed. */
  const [selected, setSelected] = useState<{
    marketId: string;
    name: string;
  } | null>(null);
  const [placing, setPlacing] = useState(false);
  // The slip follows the live price; a selection that gets suspended closes it.
  const selectedMarket = markets.find(m => m._id === selected?.marketId);
  const selectedRunner = selectedMarket?.runners.find(
    r => r.name === selected?.name,
  );
  const selectedOpen = Boolean(selectedRunner && selectedRunner.active !== false);
  const pick = (marketId: string, runner: ApiRunner) => {
    if (!kycVerified) {
      onOpenKyc?.();
    } else if (runner.active !== false) {
      setSelected({marketId, name: runner.name});
    }
  };

  const isLive = match?.status === 'Live';
  const {score, overs} = splitScore(match?.score ?? '');

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={styles.content}>
        {/* Header + scoreboard share the #0D1B2A block */}
        <View style={[styles.header, {paddingTop: insets.top + spacing.xxl}]}>
          <View style={styles.titleRow}>
            <Button
              variant="icon"
              icon="arrowLeft"
              onPress={onBack}
              accessibilityLabel="Go back"
            />
            <View style={styles.titleCopy}>
              <Text style={type.league}>{match?.league ?? ''}</Text>
              <Text style={type.matchTitle}>{match?.name ?? 'Match'}</Text>
            </View>
            {isLive ? <Badge label="LIVE" /> : null}
          </View>

          {match && !(isLive && match.scoreUrl) ? (
            <View style={styles.scoreboardWrap}>
              <Scoreboard
                home={{
                  name: match.home,
                  score: isLive ? score || '—' : '—',
                  meta: isLive ? overs : kickoff(match.startTime),
                }}
                away={{name: match.away, score: '—'}}
                isLive={isLive}
              />
            </View>
          ) : null}
          {match && isLive ? (
            <View style={styles.scoreboardWrap}>
              <MatchMedia scoreUrl={match.scoreUrl} streamUrl={match.streamUrl} />
            </View>
          ) : null}
        </View>

        <ChipBar items={tabs} activeItem={activeTab} onChange={setTab} />

        <View style={styles.body}>
          {(market || showFancy) && !kycVerified ? (
            <Pressable
              onPress={onOpenKyc}
              accessibilityRole="button"
              accessibilityLabel="KYC verify karo">
              <InfoCallout
                tone="warning"
                body="Bet lagane ke liye KYC verified hona zaroori hai. Tap karke KYC karo."
              />
            </Pressable>
          ) : null}
          {showFancy ? (
            fancy.map(prop => {
              const runner = prop.runners[0];
              const open = runner && runner.active !== false;
              return (
                <Card
                  key={prop._id}
                  style={styles.fancyCard}
                  contentStyle={styles.fancyRow}>
                  <Text style={[type.cardTitle, styles.fancyName]}>
                    {prop.name}
                  </Text>
                  {runner ? (
                    <Pressable
                      disabled={!open}
                      // Without KYC the prices can be seen, not taken.
                      onPress={() => pick(prop._id, runner)}
                      accessibilityRole="button"
                      accessibilityState={{disabled: !open}}
                      accessibilityLabel={
                        open
                          ? `${prop.name} Yes at ${runner.odds.toFixed(2)}`
                          : `${prop.name} suspended`
                      }
                      android_ripple={{color: colors.borderOdds}}
                      style={({pressed}) => [
                        styles.oddsButton,
                        styles.fancyButton,
                        (!kycVerified || !open) && styles.locked,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={type.oddsTeamLg}>Yes</Text>
                      <Text style={[type.oddsValueLg, styles.oddsValue]}>
                        {open ? runner.odds.toFixed(2) : 'SUSP'}
                      </Text>
                    </Pressable>
                  ) : null}
                </Card>
              );
            })
          ) : market ? (
            <>
              <Card contentStyle={styles.oddsCard}>
                {market.runners.map(runner => {
                  const open = runner.active !== false;
                  return (
                    <Pressable
                      key={runner.name}
                      disabled={!open}
                      // Without KYC the prices can be seen, not taken.
                      onPress={() => pick(market._id, runner)}
                      accessibilityRole="button"
                      accessibilityState={{disabled: !open}}
                      accessibilityLabel={
                        open
                          ? `${runner.name} at ${runner.odds.toFixed(2)}`
                          : `${runner.name} suspended`
                      }
                      android_ripple={{color: colors.borderOdds}}
                      style={({pressed}) => [
                        styles.oddsButton,
                        (!kycVerified || !open) && styles.locked,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={type.oddsTeamLg} numberOfLines={1}>
                        {runner.name}
                      </Text>
                      <Text style={[type.oddsValueLg, styles.oddsValue]}>
                        {open ? runner.odds.toFixed(2) : 'SUSP'}
                      </Text>
                    </Pressable>
                  );
                })}
              </Card>

              <Card style={styles.infoCard} contentStyle={styles.infoContent}>
                <Text style={type.cardTitle}>{market.name}</Text>
                <View style={styles.infoRow}>
                  <Text style={type.statText}>Max stake</Text>
                  <Text style={type.summaryValue}>{rupees(market.maxBet)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={type.statText}>Available to bet</Text>
                  <Text style={type.summaryValue}>{rupees(balance)}</Text>
                </View>
              </Card>
            </>
          ) : (
            <Text style={[type.emptyNote, styles.empty]}>
              Is match par abhi koi market open nahi hai
            </Text>
          )}
        </View>
      </ScrollView>

      <BetSlipSheet
        visible={selected !== null && selectedOpen}
        balance={balance}
        league={match?.league}
        match={match?.name}
        isLive={isLive}
        // A fancy proposition's only selection is "Yes" — say what it's a Yes on.
        selection={
          selectedMarket?.type === 'Fancy'
            ? `${selectedMarket.name}: ${selected?.name}`
            : selected?.name
        }
        odds={selectedRunner?.odds}
        busy={placing}
        onClose={() => setSelected(null)}
        onConfirm={async stake => {
          if (!selected || !selectedOpen || !onPlaceBet) {
            return;
          }
          setPlacing(true);
          const ok = await onPlaceBet({
            marketId: selected.marketId,
            selection: selected.name,
            stake,
          });
          setPlacing(false);
          if (ok) {
            setSelected(null);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  locked: {
    opacity: 0.5,
  },
  fancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingLeft: spacing.xl,
    paddingRight: spacing.lg,
  },
  fancyCard: {
    marginBottom: spacing.md,
  },
  fancyName: {
    flex: 1,
  },
  fancyButton: {
    flex: 0,
    minWidth: scale(76),
    paddingVertical: spacing.md,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    paddingBottom: scale(24),
  },
  header: {
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.xl, // 16
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
  },
  titleCopy: {
    flex: 1,
  },
  scoreboardWrap: {
    paddingTop: spacing.xxl, // 20
  },
  body: {
    paddingHorizontal: spacing.gutter, // 16
    paddingTop: spacing.lg, // 12
  },
  oddsCard: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
    padding: scale(16.701),
  },
  oddsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(12.701),
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm, // 14
    backgroundColor: colors.bgBase, // #0D1B2A
    borderWidth: hairline,
    borderColor: colors.borderOdds,
  },
  oddsValue: {
    paddingTop: spacing.xs, // 4
  },
  pressed: {
    opacity: 0.75,
  },
  infoCard: {
    marginTop: spacing.lg, // 12
  },
  infoContent: {
    padding: scale(16.701),
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empty: {
    paddingVertical: scale(32),
  },
});
