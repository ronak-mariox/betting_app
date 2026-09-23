import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';

type BadgeProps = {
  label: string;
  /**
   * `live` shows the pulsing-style white dot used by the LIVE pill.
   * `status` is the bet-state pill (Open / Won ✓ / Lost ✗) and needs
   * `color` + `backgroundColor`.
   */
  variant?: 'live' | 'count' | 'overs' | 'status';
  /** Label colour — `status` only. */
  color?: string;
  /** Pill fill — `status` only. */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The rounded pill used for LIVE, the "4" live-match counter, the "15.1 Ov"
 * overs chip and the bet-status tags. All share px 8 / py 2 and a full radius.
 */
export const Badge = ({
  label,
  variant = 'live',
  color,
  backgroundColor,
  style,
}: BadgeProps) => (
  <View
    style={[
      styles.base,
      variant === 'overs' ? styles.overs : styles.solid,
      variant === 'status' && {backgroundColor},
      style,
    ]}>
    {variant === 'live' ? <View style={styles.dot} /> : null}
    <Text
      style={[
        variant === 'overs' ? type.overs : type.badge,
        variant === 'status' && [type.statusPill, {color}],
      ]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 4
    paddingHorizontal: spacing.md, // 8
    paddingVertical: spacing.xxs, // 2
    borderRadius: radius.pill,
  },
  solid: {
    backgroundColor: colors.live, // #FF3D71
  },
  overs: {
    backgroundColor: colors.tintLive, // rgba(255,61,113,0.1)
  },
  dot: {
    width: scale(5.99),
    height: scale(5.99),
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    opacity: 0.82,
  },
});
