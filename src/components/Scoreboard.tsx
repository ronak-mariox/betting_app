import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';
import {Card} from './Card';

export type ScoreboardTeam = {
  name: string;
  score: string;
  /** Shown under the home score only — "15.1 Ov". */
  meta?: string;
};

type ScoreboardProps = {
  home: ScoreboardTeam;
  away: ScoreboardTeam;
  isLive?: boolean;
};

/** Head-to-head score panel at the top of the match detail screen. */
export const Scoreboard = ({home, away, isLive = false}: ScoreboardProps) => (
  <Card contentStyle={styles.content}>
    <View style={styles.team}>
      <Text style={[type.teamName, styles.center]} numberOfLines={2}>
        {home.name}
      </Text>
      <Text style={[type.bigScore, styles.score]}>{home.score}</Text>
      {home.meta ? (
        <Text style={[type.scoreMeta, styles.meta]}>{home.meta}</Text>
      ) : null}
    </View>

    <View style={styles.middle}>
      <Text style={type.versusMuted}>VS</Text>
      {isLive ? (
        <View style={styles.livePill}>
          <Text style={type.badgeMini}>LIVE</Text>
        </View>
      ) : null}
    </View>

    <View style={styles.team}>
      <Text style={[type.teamName, styles.center]} numberOfLines={2}>
        {away.name}
      </Text>
      <Text style={[type.bigScore, styles.score]}>{away.score}</Text>
      {away.meta ? (
        <Text style={[type.scoreMeta, styles.meta]}>{away.meta}</Text>
      ) : null}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16.701),
  },
  team: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  score: {
    paddingTop: spacing.xs, // 4
  },
  meta: {
    paddingTop: spacing.xs, // 4
  },
  middle: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl, // 16
  },
  livePill: {
    marginTop: spacing.xs, // 4
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xxs, // 2
    borderRadius: radius.pill,
    backgroundColor: colors.live,
  },
});
