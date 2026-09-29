import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';

export type MatchStat = {
  label: string;
  /** Displayed as-is; the bar splits on `homeWeight` / `awayWeight`. */
  home: string;
  away: string;
  homeWeight: number;
  awayWeight: number;
};

type StatComparisonRowProps = {
  stat: MatchStat;
};

/**
 * "6.8 — Run Rate — 5.9" with a two-tone proportional bar beneath.
 * Segment widths come from the weights, so the bar always reflects the values.
 */
export const StatComparisonRow = ({stat}: StatComparisonRowProps) => (
  <View style={styles.row}>
    <View style={styles.labels}>
      <Text style={type.statText}>{stat.home}</Text>
      <Text style={type.statText}>{stat.label}</Text>
      <Text style={type.statText}>{stat.away}</Text>
    </View>

    <View style={styles.bar}>
      <View style={[styles.segment, styles.home, {flex: stat.homeWeight}]} />
      <View style={styles.spacer} />
      <View style={[styles.segment, styles.away, {flex: stat.awayWeight}]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    paddingTop: spacing.lg, // 12
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bar: {
    flexDirection: 'row',
    height: scale(5.99),
    marginTop: spacing.sm, // 6
    gap: spacing.xxs, // 2
  },
  segment: {
    height: '100%',
    borderRadius: radius.pill,
  },
  home: {
    backgroundColor: colors.primary, // #1E88E5
  },
  away: {
    backgroundColor: colors.primaryMid, // #0D6CC4
  },
  spacer: {
    width: scale(7), // neutral gap between the two halves
  },
});
