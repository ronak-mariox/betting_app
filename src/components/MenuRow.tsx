import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Icon, IconName} from './Icon';

export type MenuItem = {
  id: string;
  icon: IconName;
  label: string;
  /** Green sub-label — "₹250 per referral". */
  hint?: string;
  /** Icon-well tint; defaults to the cyan well. */
  wellColor?: string;
};

type MenuRowProps = {
  item: MenuItem;
  /** Hidden on the last row of a group. */
  showDivider?: boolean;
  onPress?: (id: string) => void;
};

/** One row of the profile menu list — icon well, label, chevron. */
export const MenuRow = ({item, showDivider = true, onPress}: MenuRowProps) => (
  <Pressable
    onPress={() => onPress?.(item.id)}
    accessibilityRole="button"
    accessibilityLabel={item.label}
    android_ripple={{color: colors.borderOdds}}
    style={({pressed}) => [
      styles.row,
      showDivider && styles.divider,
      pressed && styles.pressed,
    ]}>
    <View
      style={[
        styles.well,
        {backgroundColor: item.wellColor ?? colors.wellMenu},
      ]}>
      <Icon name={item.icon} />
    </View>

    <View style={styles.copy}>
      <Text style={type.menuLabel}>{item.label}</Text>
      {item.hint ? <Text style={type.menuHint}>{item.hint}</Text> : null}
    </View>

    <Icon name="chevronRightMd" />
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl, // 16
    paddingTop: spacing.xl, // 16
    paddingBottom: scale(16.701),
  },
  divider: {
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderTile,
  },
  well: {
    width: scale(35.997),
    height: scale(35.997),
    borderRadius: radius.sm, // 14
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});
