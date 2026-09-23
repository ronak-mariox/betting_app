import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  /**
   * `tab` — market selector: 15% blue fill, white active label.
   * `stake` — quick-stake amounts: 20% blue fill, cyan active label,
   *   and a visible hairline when inactive.
   * `segment` — Open/Settled switch: solid #1E88E5 when active, no border.
   * `amount` — deposit quick amounts: like `stake` with a dimmer idle label.
   * `help` — Help tabs: solid #1E88E5 when active, hairline border when not.
   */
  tone?: 'tab' | 'stake' | 'segment' | 'amount' | 'help';
  style?: StyleProp<ViewStyle>;
};

const activeText = {
  tab: colors.textPrimary,
  stake: colors.accent,
  segment: colors.textPrimary,
  amount: colors.accent,
  help: colors.textPrimary,
};
const inactiveText = {
  tab: colors.textMuted,
  stake: colors.textLabel,
  segment: colors.textMuted,
  amount: colors.textMuted,
  help: colors.textMuted,
};

/** Pill button used for market tabs, quick-stake amounts and segment switches. */
export const Chip = ({
  label,
  active = false,
  onPress,
  tone = 'tab',
  style,
}: ChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="tab"
    accessibilityState={{selected: active}}
    android_ripple={{color: colors.borderOdds}}
    style={({pressed}) => [
      styles.chip,
      (tone === 'stake' || tone === 'amount' || tone === 'help') &&
        styles.chipStake,
      tone === 'segment' && styles.chipSegment,
      active ? activeStyles[tone] : inactiveStyles[tone],
      pressed && styles.pressed,
      style,
    ]}>
    <Text
      style={[
        type.chip,
        {color: active ? activeText[tone] : inactiveText[tone]},
      ]}>
      {label}
    </Text>
  </Pressable>
);

type ChipBarProps = {
  items: string[];
  activeItem: string;
  onChange: (item: string) => void;
};

/** Horizontally scrolling row of chips — the market selector. */
export const ChipBar = ({items, activeItem, onChange}: ChipBarProps) => (
  <View style={styles.bar}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.barContent}>
      {items.map(item => (
        <Chip
          key={item}
          label={item}
          active={item === activeItem}
          onPress={() => onChange(item)}
        />
      ))}
    </ScrollView>
  </View>
);

/** Declared after `styles` via the getters below to keep the map readable. */
const activeStyles = {
  get tab() {
    return styles.active;
  },
  get stake() {
    return styles.activeStake;
  },
  get segment() {
    return styles.activeSegment;
  },
  get amount() {
    return styles.activeStake;
  },
  get help() {
    return styles.activeHelp;
  },
};

const inactiveStyles = {
  get tab() {
    return styles.inactive;
  },
  get stake() {
    return styles.inactiveStake;
  },
  get segment() {
    return styles.inactiveSegment;
  },
  get amount() {
    return styles.inactiveStake;
  },
  get help() {
    return styles.inactiveHelp;
  },
};

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(16.701),
    paddingVertical: scale(8.701),
    borderRadius: radius.sm, // 14
    borderWidth: hairline,
  },
  active: {
    backgroundColor: colors.tintChipActive,
    borderColor: colors.primary,
  },
  inactive: {
    backgroundColor: colors.surface,
    borderColor: 'transparent',
  },
  chipStake: {
    paddingHorizontal: hairline,
    paddingVertical: scale(8.701),
  },
  activeStake: {
    backgroundColor: colors.tintStakeActive,
    borderColor: colors.primary,
  },
  inactiveStake: {
    backgroundColor: colors.surface,
    borderColor: colors.borderOdds,
  },
  activeHelp: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inactiveHelp: {
    backgroundColor: colors.surface,
    borderColor: colors.borderCard,
  },
  chipSegment: {
    paddingHorizontal: spacing.xxl, // 20
    paddingVertical: spacing.md, // 8
    borderWidth: 0,
  },
  activeSegment: {
    backgroundColor: colors.primary, // solid #1E88E5
  },
  inactiveSegment: {
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.75,
  },
  bar: {
    backgroundColor: colors.bgBase,
  },
  barContent: {
    gap: spacing.md, // 8
    paddingHorizontal: spacing.gutter, // 16
    paddingVertical: spacing.lg, // 12
  },
});
