import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

export type BetMarket = {
  /** "HOME WIN" / "AWAY WIN" — rendered uppercase with 0.225 tracking. */
  label: string;
  odds: string;
  team: string;
  payout: string;
  /** Home odds are cyan, away odds are #FF8A65. */
  accent: 'home' | 'away';
};

type BetOddsButtonProps = {
  market: BetMarket;
  onPress?: () => void;
};

/** One half of the odds pair inside a match card — 14 radius on #0D1B2A. */
export const BetOddsButton = ({market, onPress}: BetOddsButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${market.label} ${market.team} at ${market.odds}`}
    android_ripple={{color: colors.borderOdds}}
    style={({pressed}) => [styles.button, pressed && styles.pressed]}>
    <Text style={type.oddsLabel}>{market.label}</Text>
    <Text
      style={[
        type.oddsValue,
        {color: market.accent === 'home' ? colors.accent : colors.oddsAway},
      ]}>
      {market.odds}
    </Text>
    <Text style={type.oddsTeam} numberOfLines={1}>
      {market.team}
    </Text>
    <Text style={[type.oddsPayout, styles.payout]} numberOfLines={1}>
      {market.payout}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs, // 2
    padding: scale(10.701),
    borderRadius: radius.sm, // 14
    backgroundColor: colors.bgBase, // #0D1B2A
    borderWidth: hairline,
    borderColor: colors.borderOdds,
    overflow: 'hidden',
  },
  payout: {
    paddingTop: spacing.xxs, // 2
  },
  pressed: {
    opacity: 0.75,
  },
});
