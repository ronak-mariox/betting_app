import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Badge,
  Button,
  Card,
  ChipBar,
  Scoreboard,
  StatComparisonRow,
} from '../components';
import {matchDetail, matchStats} from '../data/match';
import {notify} from '../utils/actions';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {BetSlipSheet} from './BetSlipSheet';

type MatchScreenProps = {
  onBack?: () => void;
  /** Live wallet balance in rupees; the slip gates the stake on it. */
  balance?: number;
  /** Fires with the confirmed bet so it can join My Bets. */
  onPlaceBet?: (bet: {
    match: string;
    selection: string;
    odds: number;
    stake: number;
  }) => void;
};

/** Match detail — Figma node 7:3617. Tapping an odds button opens the bet slip. */
export const MatchScreen = ({
  onBack,
  balance,
  onPlaceBet,
}: MatchScreenProps) => {
  const insets = useSafeAreaInsets();
  const [market, setMarket] = useState(matchDetail.markets[0]);
  /** The odds button that opened the slip — null while it's closed. */
  const [selected, setSelected] = useState<{team: string; value: string} | null>(
    null,
  );

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
              <Text style={type.league}>{matchDetail.league}</Text>
              <Text style={type.matchTitle}>{matchDetail.title}</Text>
            </View>
            {matchDetail.isLive ? <Badge label="LIVE" /> : null}
          </View>

          <View style={styles.scoreboardWrap}>
            <Scoreboard
              home={matchDetail.home}
              away={matchDetail.away}
              isLive={matchDetail.isLive}
            />
          </View>
        </View>

        <ChipBar
          items={matchDetail.markets}
          activeItem={market}
          onChange={setMarket}
        />

        <View style={styles.body}>
          <Card contentStyle={styles.oddsCard}>
            {matchDetail.odds.map(odd => (
              <Pressable
                key={odd.team}
                onPress={() => setSelected({team: odd.team, value: odd.value})}
                accessibilityRole="button"
                accessibilityLabel={`${odd.team} at ${odd.value}`}
                android_ripple={{color: colors.borderOdds}}
                style={({pressed}) => [
                  styles.oddsButton,
                  pressed && styles.pressed,
                ]}>
                <Text style={type.oddsTeamLg}>{odd.team}</Text>
                <Text style={[type.oddsValueLg, styles.oddsValue]}>
                  {odd.value}
                </Text>
              </Pressable>
            ))}
          </Card>

          <Card style={styles.statsCard} contentStyle={styles.statsContent}>
            <Text style={type.cardTitle}>Match Statistics</Text>
            {matchStats.map(stat => (
              <StatComparisonRow key={stat.label} stat={stat} />
            ))}
          </Card>
        </View>
      </ScrollView>

      <BetSlipSheet
        visible={selected !== null}
        balance={balance}
        selection={selected?.team}
        odds={selected ? Number(selected.value) : undefined}
        onClose={() => setSelected(null)}
        onConfirm={stake => {
          if (selected) {
            onPlaceBet?.({
              match: matchDetail.title,
              selection: selected.team,
              odds: Number(selected.value),
              stake,
            });
          }
          setSelected(null);
          notify('Bet lag gaya — My Bets mein dekho');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  statsCard: {
    marginTop: spacing.lg, // 12
  },
  statsContent: {
    padding: scale(16.701),
    paddingBottom: spacing.lg, // 12 — last stat row already pads above
  },
});
