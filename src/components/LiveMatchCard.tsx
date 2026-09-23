import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {scale, spacing, type} from '../theme';
import {Badge} from './Badge';
import {Card} from './Card';

export type LiveMatch = {
  id: string;
  /** Sport emoji — 🏏 / ⚽ / 🏀 */
  sport: string;
  team: string;
  score: string;
  opponent: string;
};

type LiveMatchCardProps = {
  match: LiveMatch;
  onPress?: () => void;
};

/** 176 × 111 card in the horizontally scrolling "Live Now" rail. */
export const LiveMatchCard = ({match, onPress}: LiveMatchCardProps) => (
  <Card
    variant="live"
    onPress={onPress}
    accessibilityLabel={`${match.team} vs ${match.opponent}`}
    style={styles.card}
    contentStyle={styles.content}>
    <View style={styles.topRow}>
      <Text style={type.emojiSm}>{match.sport}</Text>
      <Badge label="LIVE" />
    </View>

    <Text style={[type.liveTeam, styles.team]} numberOfLines={1}>
      {match.team}
    </Text>
    <Text style={[type.liveScore, styles.score]}>{match.score}</Text>
    <Text style={[type.liveOpponent, styles.opponent]} numberOfLines={1}>
      vs {match.opponent}
    </Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    width: scale(175.997),
    height: scale(111.33),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: scale(12.701),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
  },
  team: {
    paddingTop: spacing.md, // 8
  },
  score: {
    paddingTop: spacing.xs, // 4
  },
  opponent: {
    paddingTop: spacing.xs, // 4
  },
});
