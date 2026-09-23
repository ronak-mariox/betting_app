import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BottomNav, Button, MatchCard} from '../components';
import {liveFeed, liveHeader} from '../data/live';
import {colors, scale, spacing, type} from '../theme';

type LiveScreenProps = {
  onOpenMatch?: () => void;
  /** Only set when the screen is pushed (Home's "See All"), not from the tab bar. */
  onBack?: () => void;
  onChangeNav?: (key: string) => void;
};

/** Live matches — Figma node 8:19. Reuses the Home match card verbatim. */
export const LiveScreen = ({
  onOpenMatch,
  onBack,
  onChangeNav,
}: LiveScreenProps) => {
  const insets = useSafeAreaInsets();
  const [starred, setStarred] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(liveFeed.map(m => [m.id, Boolean(m.starred)])),
  );

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
            {liveHeader.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {liveFeed.map(match => (
          <View key={match.id} style={styles.cardWrap}>
            <MatchCard
              match={{...match, starred: starred[match.id]}}
              onPress={onOpenMatch}
              onShowMarkets={onOpenMatch}
              onToggleStar={() => toggleStar(match.id)}
            />
          </View>
        ))}

        <Text style={[type.emptyNote, styles.emptyNote]}>
          {liveHeader.emptyNote}
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
