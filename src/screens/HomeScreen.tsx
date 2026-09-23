import React, {useCallback, useState} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  BottomNav,
  Header,
  LiveMatch,
  LiveMatchCard,
  Match,
  MatchCard,
  ReferralCard,
  SearchOverlay,
  SectionHeader,
  WalletCard,
} from '../components';
import {
  liveCount,
  liveMatches,
  matches,
  referral,
  searchSuggestions,
  user,
  wallet,
  walletStats,
} from '../data/home';
import {colors, spacing} from '../theme';

type HomeScreenProps = {
  /** Name saved on Edit Profile; falls back to the mock one. */
  userName?: string;
  /** Live wallet balance, already formatted. Falls back to the mock figure. */
  balance?: string;
  /** Opens the match detail screen. */
  onOpenMatch?: () => void;
  /** Wallet card actions — same destinations as the Wallet tab's buttons. */
  onDeposit?: () => void;
  onWithdraw?: () => void;
  /** "See All" on the Live Now rail and "View All" on the Matches list. */
  onSeeAll?: (section: 'live' | 'matches') => void;
  /** Header bell. */
  onOpenNotifications?: () => void;
  /** "Invite Friends" card. */
  onOpenReferral?: () => void;
  /** Bottom-nav tab changes that route elsewhere. */
  onChangeNav?: (key: string) => void;
};

/** Home — Figma node 7:243. */
export const HomeScreen = ({
  userName = user.name,
  balance = wallet.balance,
  onOpenMatch,
  onDeposit,
  onWithdraw,
  onSeeAll,
  onOpenNotifications,
  onOpenReferral,
  onChangeNav,
}: HomeScreenProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [searching, setSearching] = useState(false);
  /** The eye on the wallet card hides the amount; the stats stay visible. */
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(matches.map(m => [m.id, Boolean(m.starred)])),
  );

  const toggleStar = useCallback((id: string) => {
    setStarred(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  const goToTab = useCallback(
    (key: string) => {
      setActiveTab(key);
      onChangeNav?.(key);
    },
    [onChangeNav],
  );

  const renderLiveMatch = useCallback(
    ({item}: ListRenderItemInfo<LiveMatch>) => (
      <LiveMatchCard match={item} onPress={onOpenMatch} />
    ),
    [onOpenMatch],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header + wallet share one gradient block, as grouped in Figma. */}
        <Header
          greeting={user.greeting}
          name={userName}
          actions={[
            {
              icon: 'bell',
              showDot: true,
              accessibilityLabel: 'Notifications',
              onPress: onOpenNotifications,
            },
            {
              icon: 'search',
              accessibilityLabel: 'Search',
              onPress: () => setSearching(true),
            },
          ]}>
          <View style={styles.walletWrap}>
            <WalletCard
              balance={balanceHidden ? wallet.hiddenBalance : balance}
              hint={wallet.hint}
              stats={walletStats}
              balanceHidden={balanceHidden}
              onToggleVisibility={() => setBalanceHidden(current => !current)}
              // The card's own hint says "Tap to view wallet →".
              onPressBalance={() => goToTab('wallet')}
              onDeposit={onDeposit}
              onWithdraw={onWithdraw}
            />
          </View>
        </Header>

        {/* Live Now rail */}
        <View style={styles.liveSection}>
          <SectionHeader
            title="Live Now"
            showLiveDot
            count={liveCount}
            actionLabel="See All"
            actionChevron
            onActionPress={() => onSeeAll?.('live')}
            style={styles.sectionHeader}
          />
          <FlatList
            horizontal
            data={liveMatches}
            keyExtractor={item => item.id}
            renderItem={renderLiveMatch}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveRail}
            ItemSeparatorComponent={LiveSeparator}
          />
        </View>

        <View style={[styles.gutter, styles.referralSpacing]}>
          <ReferralCard {...referral} onPress={onOpenReferral} />
        </View>

        <SectionHeader
          title="Matches"
          actionLabel="View All"
          onActionPress={() => onSeeAll?.('matches')}
          style={[styles.gutter, styles.matchesHeader]}
        />

        {matches.map((match: Match, index) => (
          <View
            key={match.id}
            style={[styles.gutter, index > 0 && styles.matchSpacing]}>
            <MatchCard
              match={{...match, starred: starred[match.id]}}
              onPress={onOpenMatch}
              onShowMarkets={onOpenMatch}
              onToggleStar={() => toggleStar(match.id)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Covers the scroll content but not the nav, as stacked in Figma. */}
      {searching ? (
        <SearchOverlay
          suggestions={searchSuggestions}
          onCancel={() => setSearching(false)}
          onSelect={() => {
            setSearching(false);
            onOpenMatch?.();
          }}
        />
      ) : null}

      <BottomNav activeKey={activeTab} onChange={goToTab} />
    </View>
  );
};

const LiveSeparator = () => <View style={styles.liveSeparator} />;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  walletWrap: {
    paddingTop: spacing.xl, // 16
  },
  liveSection: {
    paddingTop: spacing.xs, // 4
    paddingBottom: spacing.lg, // 12
  },
  sectionHeader: {
    paddingHorizontal: spacing.gutter,
  },
  liveRail: {
    paddingTop: spacing.lg, // 12
    paddingHorizontal: spacing.gutter,
  },
  liveSeparator: {
    width: spacing.lg, // 12
  },
  gutter: {
    paddingHorizontal: spacing.gutter, // 16
  },
  referralSpacing: {
    paddingTop: spacing.lg, // 12
  },
  matchesHeader: {
    paddingTop: spacing.xl, // 16
    paddingBottom: spacing.md, // 8
  },
  matchSpacing: {
    paddingTop: spacing.lg, // 12
  },
});
