import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Icon, IconName} from './Icon';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  /** Omitted by the search field, which has no label above it. */
  label?: string;
  /** Leading glyph inside the field — user / lock / search. */
  icon: IconName;
  /** Renders the show/hide password toggle and starts obscured. */
  secure?: boolean;
  /** `md` = 56 tall form field (gap 12); `sm` = 48 tall search field (gap 8). */
  size?: 'md' | 'sm';
};

/**
 * Input on a #14253D fill with a 10% white hairline and 16 radius.
 * The password variant adds an eye toggle on the right.
 */
export const TextField = ({
  label,
  icon,
  secure = false,
  size = 'md',
  ...inputProps
}: TextFieldProps) => {
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={size === 'sm' && styles.flex}>
      {label ? <Text style={type.fieldLabel}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          size === 'sm' && styles.fieldSm,
          !label && styles.fieldUnlabelled,
        ]}>
        <Icon name={icon} />
        <TextInput
          {...inputProps}
          style={[type.input, styles.input]}
          placeholderTextColor={colors.textDim}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden(current => !current)}
            hitSlop={spacing.lg}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Icon name="eyeSm" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    height: scale(55.994),
    marginTop: spacing.md, // 8
    paddingHorizontal: scale(16.701),
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  fieldSm: {
    height: scale(47.999), // 48 — search field
    gap: spacing.md, // 8
  },
  fieldUnlabelled: {
    marginTop: 0,
  },
  input: {
    flex: 1,
    // Android adds its own vertical padding; the 56 height already accounts for it.
    paddingVertical: 0,
  },
});
