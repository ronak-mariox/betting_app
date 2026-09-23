import React, {PropsWithChildren} from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, gradients, GradientToken, hairline, radius} from '../theme';

type CardVariant =
  /** Flat raised surface — #14253D, 16 radius, 0.701 hairline border. */
  | 'surface'
  /** Same surface with the live-match pink border. */
  | 'live'
  /** Painted with one of the gradient tokens. */
  | 'gradient';

type CardProps = PropsWithChildren<{
  variant?: CardVariant;
  /** Required when `variant="gradient"`. */
  gradient?: GradientToken;
  /** Border colour override (defaults per variant). */
  borderColor?: string;
  /** Makes the whole card tappable with platform-appropriate feedback. */
  onPress?: () => void;
  /** Announced when the whole card is the tap target. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

/**
 * The single rounded-surface primitive behind every panel on the Home screen:
 * match cards, live cards, the wallet, the bonus banner and the referral row.
 */
export const Card = ({
  variant = 'surface',
  gradient,
  borderColor,
  onPress,
  accessibilityLabel,
  style,
  contentStyle,
  children,
}: CardProps) => {
  const border =
    borderColor ??
    (variant === 'live'
      ? colors.borderLive
      : variant === 'gradient'
      ? 'transparent'
      : colors.borderCard);

  const frame: StyleProp<ViewStyle> = [
    styles.base,
    variant !== 'gradient' && styles.surface,
    {borderColor: border, borderWidth: border === 'transparent' ? 0 : hairline},
    style,
  ];

  const body =
    variant === 'gradient' && gradient ? (
      <LinearGradient
        useAngle
        angle={gradients[gradient].angle}
        colors={[...gradients[gradient].colors]}
        locations={[...gradients[gradient].locations]}
        style={[styles.fill, contentStyle]}>
        {children}
      </LinearGradient>
    ) : (
      <View style={[styles.fill, contentStyle]}>{children}</View>
    );

  if (!onPress) {
    return <View style={frame}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{color: colors.borderOdds}}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({pressed}) => [frame, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    // Clips the gradient + decorative circles to the rounded corners.
    overflow: 'hidden',
  },
  surface: {
    backgroundColor: colors.surface,
  },
  fill: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
});
