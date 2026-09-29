import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BottomNav, Button, Match, MatchCard} from '../components';
import {liveHeader} from '../data/live';
import {colors, scale, spacing, type} from '../theme';

type LiveScreenProps = {
  /** Matches currently in play, from the backend. */
  matches?: Match[];
  onOpenMatch?: (id: string) => void;
  /** Only set when the screen is pushed (Home's "See All"), not from the tab bar. */
  onBack?: () => void;
  onChangeNav?: (key: string) => void;
};

/** Live matches — Figma node 8:19. Reuses the Home match card verbatim. */
export const LiveScreen = ({
  matches = [],
  onOpenMatch,
  onBack,
  onChangeNav,
}: LiveScreenProps) => {
  const insets = useSafeAreaInsets();
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  const toggleStar = useCallback((id: string) => {
    setStarred(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.xxl}]}>
        {onBack ? (
          <Button
            variant="icon"
            icon="arrowLeft"
            onPress={onBack}
            accessibilityLabel="Go back"
          />
        ) : null}
        {/* Title and subtitle sit to the right of the arrow, on one row. */}
        <View style={styles.copy}>
          <Text style={type.pageTitle}>{liveHeader.title}</Text>
          <Text style={[type.screenSubtitle, styles.subtitle]}>
            {`${matches.length} ${matches.length === 1 ? 'match' : 'matches'} in progress`}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {matches.map(match => (
          <View key={match.id} style={styles.cardWrap}>
            <MatchCard
              match={{...match, starred: starred[match.id]}}
              onPress={() => onOpenMatch?.(match.id)}
              onShowMarkets={() => onOpenMatch?.(match.id)}
              onSelectMarket={() => onOpenMatch?.(match.id)}
              onToggleStar={() => toggleStar(match.id)}
            />
          </View>
        ))}

        <Text style={[type.emptyNote, styles.emptyNote]}>
          {matches.length === 0
            ? 'Abhi koi live match nahi hai'
            : liveHeader.emptyNote}
        </Text>
      </ScrollView>

      <BottomNav activeKey="live" onChange={key => onChangeNav?.(key)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12 — same arrow-to-title gap as BackHeader
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.lg, // 12
  },
  copy: {
    flex: 1,
  },
  subtitle: {
    paddingTop: spacing.xs, // 4
  },
  list: {
    paddingHorizontal: spacing.gutter, // 16
  },
  cardWrap: {
    paddingTop: spacing.xl, // 16 first card, 12 gap + 4 — matches the frame
  },
  emptyNote: {
    paddingTop: scale(44),
    paddingBottom: scale(32),
  },
});
