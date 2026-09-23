import React, {PropsWithChildren} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, spacing, type} from '../theme';

type SettingsGroupProps = PropsWithChildren<{
  /** Uppercase section heading — "NOTIFICATIONS", "PREFERENCES". */
  title: string;
}>;

/** Bordered group with a tinted header strip; rows supply their own dividers. */
export const SettingsGroup = ({title, children}: SettingsGroupProps) => (
  <View style={styles.group}>
    <View style={styles.header}>
      <Text style={type.groupHeading}>{title}</Text>
    </View>
    {children}
  </View>
);

/** One row inside a group — divider on top, #14253D fill. */
export const SettingsRow = ({children}: PropsWithChildren) => (
  <View style={styles.row}>{children}</View>
);

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.md, // 16
    borderWidth: hairline,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: spacing.lg, // 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl, // 16
    paddingTop: spacing.xl, // 16.701
    paddingBottom: spacing.xl, // 16
    borderTopWidth: hairline,
    borderTopColor: colors.borderTile,
  },
});
