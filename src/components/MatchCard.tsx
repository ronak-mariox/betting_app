import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, hairline, scale, spacing, type} from '../theme';
import {Badge} from './Badge';
import {BetMarket, BetOddsButton} from './BetOddsButton';
import {Card} from './Card';
import {Icon} from './Icon';

export type MatchTeam = {
  name: string;
  /** Score for live games; omitted for upcoming ones. */
  score?: string;
};

export type Match = {
  id: string;
  sport: string;
  league: string;
  isLive: boolean;
  /** "15.1 Ov" for live games. */
  overs?: string;
  /** "Today 7:30 PM" for upcoming games. */
  kickoff?: string;
  /** Status line under each team name when the game hasn't started. */
  statusLabel?: string;
  starred?: boolean;
  home: MatchTeam;
  away: MatchTeam;
  markets: [BetMarket, BetMarket];
  extraMarkets: number;
};

type MatchCardProps = {
  match: Match;
  onPress?: () => void;
  onToggleStar?: () => void;
  onSelectMarket?: (market: BetMarket) => void;
  onShowMarkets?: () => void;
};

/**
 * Full-width match card. Five stacked rows, exactly as grouped in Figma:
 * league header → teams & score → hint strip → odds pair → "more markets".
 */
export const MatchCard = ({
  match,
  onPress,
  onToggleStar,
  onSelectMarket,
  onShowMarkets,
}: MatchCardProps) => (
  <Card onPress={onPress}>
    {/* 1 — league + live/kick-off status */}
    <View style={styles.headerRow}>
      <View style={styles.leagueGroup}>
        <Text style={type.emojiMd}>{match.sport}</Text>
        <Text style={type.league}>{match.league}</Text>
      </View>

      <View style={styles.statusGroup}>
        {match.isLive ? (
          <Badge label="LIVE" />
        ) : (
          <Text style={type.kickoff}>{match.kickoff}</Text>
        )}
        <Pressable
          onPress={onToggleStar}
          hitSlop={spacing.lg}
          accessibilityRole="button"
          accessibilityLabel={
            match.starred ? 'Remove from favourites' : 'Add to favourites'
          }>
          <Icon name={match.starred ? 'star' : 'starOutline'} />
        </Pressable>
      </View>
    </View>

    {/* 2 — teams, scores and the overs chip / VS separator */}
    <View style={styles.teamsRow}>
      <View style={styles.team}>
        <Text style={type.teamName} numberOfLines={1}>
          {match.home.name}
        </Text>
        {match.home.score ? (
          <Text style={type.score}>{match.home.score}</Text>
        ) : (
          <Text style={[type.teamStatus, styles.statusLine]}>
            {match.statusLabel}
          </Text>
        )}
      </View>

      <View style={styles.separator}>
        {match.isLive && match.overs ? (
          <Badge label={match.overs} variant="overs" />
        ) : (
          <Text style={type.versus}>VS</Text>
        )}
      </View>

      <View style={[styles.team, styles.teamRight]}>
        <Text style={[type.teamName, styles.alignRight]} numberOfLines={1}>
          {match.away.name}
        </Text>
        {match.away.score ? (
          <Text style={[type.score, styles.alignRight]}>{match.away.score}</Text>
        ) : (
          <Text
            style={[type.teamStatus, styles.statusLine, styles.alignRight]}>
            {match.statusLabel}
          </Text>
        )}
      </View>
    </View>

    {/* 3 — how-to-bet hint strip */}
    <View style={styles.hintRow}>
      <Text style={type.emojiXs}>👆</Text>
      <Text style={type.hint}>Kisi ek team ko chuno aur bet lagao</Text>
      <View style={styles.hintLinkWrap}>
        <Text style={type.hintLink}>Kaise kaam karta hai?</Text>
      </View>
    </View>

    {/* 4 — the two odds buttons */}
    <View style={styles.oddsRow}>
      {match.markets.map(market => (
        <BetOddsButton
          key={market.label}
          market={market}
          onPress={() => onSelectMarket?.(market)}
        />
      ))}
    </View>

    {/* 5 — footer link into the full market list */}
    <Pressable
      onPress={onShowMarkets}
      android_ripple={{color: colors.borderOdds}}
      style={({pressed}) => [styles.footer, pressed && styles.pressed]}>
      <Text style={type.moreMarkets}>
        +{match.extraMarkets} aur markets dekho
      </Text>
      <Icon name="chevronRightSm" />
    </Pressable>
  </Card>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, // 16
    paddingTop: spacing.lg, // 12
    paddingBottom: spacing.md, // 8
  },
  leagueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl, // 16
    paddingBottom: spacing.lg, // 12
  },
  team: {
    flex: 1,
  },
  teamRight: {
    alignItems: 'flex-end',
  },
  alignRight: {
    textAlign: 'right',
  },
  statusLine: {
    paddingTop: spacing.xxs, // 2
  },
  separator: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // 12
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 6
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: scale(6.701),
    backgroundColor: colors.tintRow,
    borderTopWidth: hairline,
    borderBottomWidth: hairline,
    borderColor: colors.borderHairline,
  },
  hintLinkWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  oddsRow: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    padding: spacing.lg, // 12
    height: scale(99.864),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs, // 4
    height: scale(37.19),
    backgroundColor: colors.tintRow,
    borderTopWidth: hairline,
    borderColor: colors.borderHairline,
  },
  pressed: {
    opacity: 0.8,
  },
});
