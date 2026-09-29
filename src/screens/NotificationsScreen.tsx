import React, {useState} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components';
import type {AppNotification} from '../data/notifications';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type NotificationsScreenProps = {
  /** The player's feed, newest first. */
  notifications?: AppNotification[];
  onBack?: () => void;
  /** Tapping a row: marks it read and opens what it's about. */
  onOpen?: (notification: AppNotification) => void;
  onMarkAllRead?: () => void;
  /** Pull to refresh. */
  onRefresh?: () => Promise<void> | void;
};

/** Notifications — Figma node 9:340. */
export const NotificationsScreen = ({
  notifications = [],
  onBack,
  onOpen,
  onMarkAllRead,
  onRefresh,
}: NotificationsScreenProps) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const hasUnread = notifications.some(item => item.unread);

  const refresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, {paddingTop: insets.top + spacing.xxl}]}>
        <View style={styles.headerLeft}>
          <Button
            variant="icon"
            icon="arrowLeft"
            onPress={onBack}
            accessibilityLabel="Go back"
          />
          <Text style={type.pageTitle}>Notifications</Text>
        </View>

        <Pressable
          onPress={onMarkAllRead}
          disabled={!hasUnread}
          hitSlop={spacing.md}
          accessibilityRole="button"
          accessibilityLabel="Mark all read"
          accessibilityState={{disabled: !hasUnread}}
          style={!hasUnread && styles.dim}>
          <Text style={type.link}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.textPrimary}
          />
        }>
        {notifications.length === 0 ? (
          <Text style={[type.emptyNote, styles.empty]}>
            Abhi koi notification nahi hai — deposit, bet result aur offers
            yahan dikhenge
          </Text>
        ) : null}
        {notifications.map(item => {
          const unread = item.unread;
          return (
            <Pressable
              key={item.id}
              onPress={() => onOpen?.(item)}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              style={({pressed}) => [
                styles.card,
                unread ? styles.unread : styles.readCard,
                pressed && styles.pressed,
              ]}>
              <Text style={type.emojiXl}>{item.emoji}</Text>

              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={type.notifTitle}>{item.title}</Text>
                  {unread ? (
                    <View testID="unread-dot" style={styles.dot} />
                  ) : null}
                </View>
                <Text style={[type.notifBody, styles.body]}>{item.body}</Text>
                <Text style={[type.notifTime, styles.time]}>{item.time}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.xl, // 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
  },
  list: {
    gap: spacing.md, // 8
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(24),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg, // 12
    padding: scale(16.701),
    borderRadius: radius.md, // 16
    borderWidth: hairline,
  },
  unread: {
    backgroundColor: colors.unreadBg,
    borderColor: colors.unreadBorder,
  },
  readCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderTile,
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: scale(7.994),
    height: scale(7.994),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  body: {
    paddingTop: spacing.xxs, // 2
  },
  time: {
    paddingTop: spacing.xs, // 4
  },
  pressed: {
    opacity: 0.8,
  },
  dim: {
    opacity: 0.4,
  },
  empty: {
    paddingTop: scale(48),
    paddingHorizontal: spacing.xl, // 16
    textAlign: 'center',
  },
});
