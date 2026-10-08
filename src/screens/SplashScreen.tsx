import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Circle, Defs, RadialGradient, Stop} from 'react-native-svg';
import {Icon} from '../components';
import {
  colors,
  gradients,
  radius,
  scale,
  shadows,
  spacing,
  type,
} from '../theme';
import {brand} from '../theme/brand';

const GLOW_SIZE = 288;
/** Progress fill is 122.763 of a 191.997 track in Figma → 63.9%. */
const PROGRESS_RATIO = 122.763 / 191.997;

type SplashScreenProps = {
  /** Fired once the loading animation completes. */
  onFinish?: () => void;
  durationMs?: number;
};

/**
 * Splash — Figma node 6:9.
 * 141.77° navy gradient, a soft blue radial glow, the 96px logo tile with the
 * bolt mark, the BetPro wordmark and a bottom progress bar.
 */
export const SplashScreen = ({
  onFinish,
  durationMs = 2200,
}: SplashScreenProps) => {
  const progress = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.inOut(Easing.quad),
        // Animating width can't use the native driver.
        useNativeDriver: false,
      }),
    ]).start(({finished}) => {
      if (finished) {
        onFinish?.();
      }
    });
  }, [durationMs, fadeIn, onFinish, progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${PROGRESS_RATIO * 100}%`],
  });

  return (
    <LinearGradient
      useAngle
      angle={gradients.splash.angle}
      colors={[...gradients.splash.colors]}
      locations={[...gradients.splash.locations]}
      style={styles.container}>
      {/* Blue radial glow — 288px, 15% opacity, centred above the logo. */}
      <View style={styles.glow} pointerEvents="none">
        <Svg
          width={scale(GLOW_SIZE)}
          height={scale(GLOW_SIZE)}
          viewBox="0 0 288 288">
          <Defs>
            <RadialGradient
              id="glow"
              cx="144"
              cy="144"
              r="203.65"
              gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="0.175" stopColor="#1766AC" stopOpacity="0.75" />
              <Stop offset="0.35" stopColor="#0F4473" stopOpacity="0.5" />
              <Stop offset="0.525" stopColor="#082239" stopOpacity="0.25" />
              <Stop offset="0.7" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="144" cy="144" r="144" fill="url(#glow)" />
        </Svg>
      </View>

      <Animated.View style={[styles.brand, {opacity: fadeIn}]}>
        <LinearGradient
          useAngle
          angle={gradients.logo.angle}
          colors={[...gradients.logo.colors]}
          locations={[...gradients.logo.locations]}
          style={styles.logoTile}>
          <Icon name="bolt" />
        </LinearGradient>

        <View>
          <Text style={type.splashTitle}>{brand.name}</Text>
          <Text style={[type.splashTagline, styles.tagline]}>
            PREMIUM BETTING
          </Text>
        </View>
      </Animated.View>

      <View style={styles.progressBlock}>
        <View style={styles.progressInner}>
          <View style={styles.track}>
            <Animated.View style={[styles.fillWrap, {width: fillWidth}]}>
              <LinearGradient
                useAngle
                angle={gradients.progress.angle}
                colors={[...gradients.progress.colors]}
                locations={[...gradients.progress.locations]}
                style={styles.fill}
              />
            </Animated.View>
          </View>
          <Text style={[type.splashLoading, styles.loading]}>Loading...</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    // Figma: 288px circle at y 137.33 of an 844 frame, horizontally centred.
    top: '16.27%',
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.15,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.xxxl, // 24
  },
  logoTile: {
    width: scale(95.999),
    height: scale(95.999),
    borderRadius: radius.lg, // 24
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.logo,
  },
  tagline: {
    paddingTop: spacing.xs, // 4
  },
  progressBlock: {
    position: 'absolute',
    bottom: scale(64),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressInner: {
    width: scale(191.997), // Figma track width
  },
  track: {
    height: scale(1.993),
    borderRadius: radius.pill,
    backgroundColor: colors.glassCircle,
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
  loading: {
    paddingTop: spacing.lg, // 12
  },
});
