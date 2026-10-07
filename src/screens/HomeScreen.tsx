import React, {useCallback, useState} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  Text,
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
  WalletStat,
} from '../components';
import {referral, user, wallet} from '../data/home';
import {colors, scale, spacing, type} from '../theme';
import {greeting} from '../utils/feed';

type HomeScreenProps = {
  /** Name saved on Edit Profile; falls back to the mock one. */
  userName?: string;
  /** Live wallet balance, already formatted. Falls back to the mock figure. */
  balance?: string;
  /** Live + upcoming matches from the backend, live first. */
  matches?: Match[];
  /** The live subset, for the "Live Now" rail. */
  liveMatches?: LiveMatch[];
  /** Today's bets / wins / losses under the balance. */
  walletStats?: WalletStat[];
  /** Opens the match detail screen for a match id. */
  onOpenMatch?: (id: string) => void;
  /** Wallet card actions — same destinations as the Wallet tab's buttons. */
  onDeposit?: () => void;
  onWithdraw?: () => void;
  /** "See All" on the Live Now rail and "View All" on the Matches list. */
  onSeeAll?: (section: 'live' | 'matches') => void;
  /** Header bell. */
  onOpenNotifications?: () => void;
  /** Red dot on the bell: the player has notifications they haven't read. */
  hasUnread?: boolean;
  /** "Invite Friends" card. */
  onOpenReferral?: () => void;
  /** Bottom-nav tab changes that route elsewhere. */
  onChangeNav?: (key: string) => void;
};

/** Home — Figma node 7:243. */
export const HomeScreen = ({
  userName = user.name,
  balance = '₹0',
  matches = [],
  liveMatches = [],
  walletStats = [],
  onOpenMatch,
  onDeposit,
  onWithdraw,
  onSeeAll,
  onOpenNotifications,
  hasUnread = false,
  onOpenReferral,
  onChangeNav,
}: HomeScreenProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [searching, setSearching] = useState(false);
  /** The eye on the wallet card hides the amount; the stats stay visible. */
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>({});

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
      <LiveMatchCard match={item} onPress={() => onOpenMatch?.(item.id)} />
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
          greeting={greeting()}
          name={userName}
          actions={[
            {
              icon: 'bell',
              showDot: hasUnread,
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
            count={liveMatches.length}
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
            ListEmptyComponent={
              <Text style={type.emptyNote}>Abhi koi live match nahi hai</Text>
            }
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

        {matches.length === 0 ? (
          <Text style={[type.emptyNote, styles.emptyMatches]}>
            Abhi koi match available nahi hai
          </Text>
        ) : null}

        {matches.map((match: Match, index) => (
          <View
            key={match.id}
            style={[styles.gutter, index > 0 && styles.matchSpacing]}>
            <MatchCard
              match={{...match, starred: starred[match.id]}}
              onPress={() => onOpenMatch?.(match.id)}
              onShowMarkets={() => onOpenMatch?.(match.id)}
              onSelectMarket={() => onOpenMatch?.(match.id)}
              onToggleStar={() => toggleStar(match.id)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Covers the scroll content but not the nav, as stacked in Figma. */}
      {searching ? (
        <SearchOverlay
          suggestions={matches.map(m => `${m.home.name} vs ${m.away.name}`)}
          onCancel={() => setSearching(false)}
          onSelect={query => {
            setSearching(false);
            const found = matches.find(
              m => `${m.home.name} vs ${m.away.name}` === query,
            );
            if (found) {
              onOpenMatch?.(found.id);
            }
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
  emptyMatches: {
    paddingVertical: scale(24),
  },
  matchSpacing: {
    paddingTop: spacing.lg, // 12
  },
});
