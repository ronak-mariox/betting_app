import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';
import {Icon, IconName} from './Icon';

export type ButtonVariant =
  /** Login — 170.7° blue gradient, 56 tall, 16 radius. */
  | 'primary'
  /** Create Account — 8% blue fill with a 40% blue hairline. */
  | 'outline'
  /** Deposit — rgba(255,255,255,0.2) on the wallet gradient. */
  | 'glass'
  /** Withdraw — rgba(255,255,255,0.12), 85% white label. */
  | 'glassSoft'
  /** Claim Now — solid #00C853. */
  | 'success'
  /** Invite — rgba(79,195,247,0.15) well with #4FC3F7 label. */
  | 'tint'
  /** Header bell/search — 40×40 #14253D square, 14 radius. */
  | 'icon'
  /** Bare text + icon row (See All / View All). */
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label?: string;
  /** Leading icon, rendered from the Figma export at its designed size. */
  icon?: IconName;
  /** Trailing icon — used by the "See All ›" links. */
  iconRight?: IconName;
  iconSize?: number;
  iconColor?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  /** Red notification dot, as on the header bell. */
  showDot?: boolean;
  /** Blocks presses and drops to 40% opacity, as the Figma login CTA does. */
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

const backgrounds: Record<ButtonVariant, string | undefined> = {
  primary: undefined, // painted by the gradient layer below
  outline: colors.tintPrimary,
  glass: colors.glass,
  glassSoft: colors.glassSoft,
  success: colors.success,
  tint: colors.tintAccent,
  icon: colors.surface,
  ghost: undefined,
};

const labelColors: Record<ButtonVariant, string> = {
  primary: colors.textPrimary,
  outline: colors.accent,
  glass: colors.textPrimary,
  glassSoft: colors.onPrimary85,
  success: colors.textPrimary,
  tint: colors.accent,
  icon: colors.textPrimary,
  ghost: colors.accent,
};

export const Button = ({
  label,
  icon,
  iconRight,
  iconSize,
  iconColor,
  variant = 'glass',
  size = 'md',
  onPress,
  showDot = false,
  disabled = false,
  accessibilityLabel,
  style,
  labelStyle,
}: ButtonProps) => {
  const isIconOnly = variant === 'icon' && !label;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      accessibilityLabel={accessibilityLabel ?? label}
      android_ripple={
        variant === 'ghost' || disabled ? undefined : {color: colors.borderOdds}
      }
      hitSlop={variant === 'ghost' ? spacing.md : undefined}
      style={({pressed}) => [
        styles.base,
        variant === 'ghost' ? styles.ghost : styles.padded,
        size === 'sm' && styles.paddedSm,
        size === 'lg' && styles.paddedLg,
        variant === 'outline' && styles.outline,
        isIconOnly && styles.iconOnly,
        {backgroundColor: backgrounds[variant]},
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient
          useAngle
          angle={gradients.ctaPrimary.angle}
          colors={[...gradients.ctaPrimary.colors]}
          locations={[...gradients.ctaPrimary.locations]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {icon ? (
        <Icon name={icon} size={iconSize} color={iconColor} />
      ) : null}
      {label ? (
        <Text
          numberOfLines={1}
          style={[
            size === 'sm'
              ? type.buttonSm
              : size === 'lg'
              ? type.buttonXl
              : type.buttonLg,
            {color: labelColors[variant]},
            labelStyle,
          ]}>
          {label}
        </Text>
      ) : null}
      {iconRight ? (
        <Icon name={iconRight} size={iconSize} color={iconColor} />
      ) : null}
      {showDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm, // 6 — icon ↔ label gap on Deposit / Withdraw
    borderRadius: radius.sm, // 14
    // Clips the `primary` gradient layer to the rounded corners.
    overflow: 'hidden',
  },
  padded: {
    paddingHorizontal: spacing.xl, // 16
    height: scale(39.994), // 40 — Deposit / Withdraw / header buttons
  },
  ghost: {
    gap: spacing.xs, // 4 — "See All" label ↔ chevron
  },
  paddedLg: {
    height: scale(55.994), // 56 — Login / Create Account
    borderRadius: radius.md, // 16
  },
  outline: {
    borderWidth: hairline,
    borderColor: colors.borderPrimary,
  },
  paddedSm: {
    paddingHorizontal: spacing.lg, // 12
    paddingVertical: spacing.sm, // 6
    height: undefined,
    gap: spacing.xs,
  },
  iconOnly: {
    width: scale(39.994),
    height: scale(39.994),
    paddingHorizontal: 0,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4, // Figma renders the empty-form login CTA at 40%
  },
  dot: {
    position: 'absolute',
    // Figma: 8px dot at x 26.01 / y 6.13 inside the 40px button.
    top: scale(6.13),
    left: scale(26.01),
    width: scale(7.994),
    height: scale(7.994),
    borderRadius: radius.pill,
    backgroundColor: colors.live,
    borderWidth: hairline,
    borderColor: 'transparent',
  },
});
