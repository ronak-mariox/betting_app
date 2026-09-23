import React, {PropsWithChildren} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {gradients, spacing, type} from '../theme';
import {Button} from './Button';
import {IconName} from './Icon';

export type HeaderAction = {
  icon: IconName;
  onPress?: () => void;
  /** Red notification dot (the bell has one in the design). */
  showDot?: boolean;
  accessibilityLabel: string;
};

type HeaderProps = PropsWithChildren<{
  /** Small muted line above the name — "Good evening 👋". */
  greeting: string;
  /** Bold 18/28 title — the signed-in user. */
  name: string;
  actions?: HeaderAction[];
  /** Anything rendered under the greeting row inside the same gradient block. */
}>;

/**
 * Home header: greeting + user on the left, icon buttons on the right, over a
 * top-to-bottom #0D1B2A → #07111F gradient. Padding: 20 top / 16 sides /
 * 16 bottom, plus the device's safe-area top inset.
 */
export const Header = ({greeting, name, actions = [], children}: HeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      useAngle
      angle={gradients.header.angle}
      colors={[...gradients.header.colors]}
      locations={[...gradients.header.locations]}
      style={[styles.container, {paddingTop: insets.top + spacing.xxl}]}>
      <View style={styles.row}>
        <View style={styles.identity}>
          <Text style={type.greeting}>{greeting}</Text>
          <Text style={type.userName} numberOfLines={1}>
            {name}
          </Text>
        </View>

        <View style={styles.actions}>
          {actions.map(action => (
            <Button
              key={action.icon}
              variant="icon"
              icon={action.icon}
              onPress={action.onPress}
              showDot={action.showDot}
              accessibilityLabel={action.accessibilityLabel}
            />
          ))}
        </View>
      </View>

      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: spacing.xl, // 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexShrink: 1,
    paddingRight: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md, // 8
  },
});
