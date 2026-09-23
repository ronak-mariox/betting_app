import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components';
import {notifications} from '../data/notifications';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type NotificationsScreenProps = {
  onBack?: () => void;
};

/** Notifications — Figma node 9:340. */
export const NotificationsScreen = ({onBack}: NotificationsScreenProps) => {
  const insets = useSafeAreaInsets();
  const [read, setRead] = useState<Record<string, boolean>>({});

  const markAllRead = () =>
    setRead(Object.fromEntries(notifications.map(n => [n.id, true])));

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
          onPress={markAllRead}
          hitSlop={spacing.md}
          accessibilityRole="button">
          <Text style={type.link}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {notifications.map(item => {
          const unread = item.unread && !read[item.id];
          return (
            <Pressable
              key={item.id}
              onPress={() => setRead(prev => ({...prev, [item.id]: true}))}
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
});
