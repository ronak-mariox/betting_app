import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Icon, IconName} from './Icon';

type PickerFieldProps = {
  label: string;
  icon: IconName;
  value: string;
  placeholder: string;
  onPress: () => void;
  /** Shows the dropdown chevron (document type); the date field has none. */
  chevron?: boolean;
};

/**
 * A field that opens a picker instead of the keyboard — same #14253D / 16
 * radius shell as TextField, turning blue once a value is chosen.
 */
export const PickerField = ({
  label,
  icon,
  value,
  placeholder,
  onPress,
  chevron = false,
}: PickerFieldProps) => (
  <View>
    <Text style={type.fieldLabel}>{label}</Text>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={value ? {text: value} : undefined}
      style={({pressed}) => [
        styles.field,
        value ? styles.fieldSet : null,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} />
      <Text
        style={[
          chevron ? type.menuLabel : type.input,
          styles.text,
          !value && styles.placeholder,
        ]}
        numberOfLines={1}>
        {value || placeholder}
      </Text>
      {chevron ? <Icon name="chevronDown" size={15.994} /> : null}
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    height: scale(55.994),
    marginTop: spacing.md, // 8
    paddingHorizontal: spacing.xl, // 16
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  fieldSet: {
    borderColor: colors.primary,
  },
  text: {
    flex: 1,
  },
  placeholder: {
    color: colors.textDim,
  },
  pressed: {
    opacity: 0.8,
  },
});
