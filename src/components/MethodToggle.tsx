import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Icon, IconName} from './Icon';

export type ToggleOption = {
  id: string;
  label: string;
  icon: IconName;
};

type MethodToggleProps = {
  options: ToggleOption[];
  value: string;
  onChange: (id: string) => void;
};

/**
 * Two-up icon + label selector — the withdrawal method switch.
 * Active is a 15% blue fill with a solid #1E88E5 hairline and cyan label.
 */
export const MethodToggle = ({
  options,
  value,
  onChange,
}: MethodToggleProps) => (
  <View style={styles.row}>
    {options.map(option => {
      const active = option.id === value;
      return (
        <Pressable
          key={option.id}
          onPress={() => onChange(option.id)}
          accessibilityRole="tab"
          accessibilityState={{selected: active}}
          accessibilityLabel={option.label}
          android_ripple={{color: colors.borderOdds}}
          style={({pressed}) => [
            styles.option,
            active ? styles.active : styles.inactive,
            pressed && styles.pressed,
          ]}>
          <Icon
            name={option.icon}
            color={active ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              type.buttonLg,
              {color: active ? colors.accent : colors.textMuted},
            ]}>
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md, // 8
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
    paddingVertical: scale(12.701),
    borderRadius: radius.sm, // 14
    borderWidth: hairline,
  },
  active: {
    backgroundColor: colors.tintChipActive,
    borderColor: colors.primary,
  },
  inactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderOdds,
  },
  pressed: {
    opacity: 0.75,
  },
});
