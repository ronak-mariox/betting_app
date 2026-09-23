import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {colors, radius, scale} from '../theme';

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

/** 44 × 24 switch — #1E88E5 when on, with a 20px white knob. */
export const Toggle = ({value, onChange, accessibilityLabel}: ToggleProps) => (
  <Pressable
    onPress={() => onChange(!value)}
    accessibilityRole="switch"
    accessibilityState={{checked: value}}
    accessibilityLabel={accessibilityLabel}
    hitSlop={scale(8)}
    style={[styles.track, value ? styles.on : styles.off]}>
    <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
  </Pressable>
);

const styles = StyleSheet.create({
  track: {
    width: scale(43.991),
    height: scale(23.994),
    borderRadius: radius.sm - scale(2), // 12
    justifyContent: 'center',
  },
  on: {
    backgroundColor: colors.primary,
  },
  off: {
    backgroundColor: colors.bgBase,
  },
  knob: {
    position: 'absolute',
    width: scale(19.997),
    height: scale(19.997),
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
  },
  knobOn: {
    left: scale(21.99),
  },
  knobOff: {
    left: scale(1.99),
  },
});
