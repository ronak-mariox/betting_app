import React, {PropsWithChildren} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {colors, hairline, scale, spacing} from '../theme';
import {Icon} from './Icon';

type CheckboxProps = PropsWithChildren<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel: string;
}>;

/** 20px checkbox with its label to the right — 8 radius, blue when checked. */
export const Checkbox = ({
  checked,
  onChange,
  accessibilityLabel,
  children,
}: CheckboxProps) => (
  <Pressable
    onPress={() => onChange(!checked)}
    accessibilityRole="checkbox"
    accessibilityState={{checked}}
    accessibilityLabel={accessibilityLabel}
    style={styles.row}>
    <View style={[styles.box, checked ? styles.boxOn : styles.boxOff]}>
      {checked ? <Icon name="checkBox" /> : null}
    </View>
    <View style={styles.label}>{children}</View>
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg, // 12
  },
  box: {
    width: scale(19.997),
    height: scale(19.997),
    marginTop: spacing.xxs, // 2
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
  },
  boxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  boxOff: {
    backgroundColor: 'transparent',
    borderColor: colors.borderRadio, // 20% white
  },
  label: {
    flex: 1,
  },
});
