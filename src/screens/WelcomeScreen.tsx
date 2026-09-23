import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, FeatureCard, Icon} from '../components';
import {features, welcome} from '../data/welcome';
import {colors, gradients, radius, scale, spacing, type} from '../theme';

type WelcomeScreenProps = {
  onLogin?: () => void;
  onCreateAccount?: () => void;
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
};

/**
 * Welcome / auth landing — Figma node 7:30.
 * Hero block (logo, wordmark, tagline, 2 × 2 feature grid) fills the space
 * above a pinned CTA footer.
 */
export const WelcomeScreen = ({
  onLogin,
  onCreateAccount,
  onPressTerms,
  onPressPrivacy,
}: WelcomeScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, {paddingTop: insets.top + spacing.xxxxl}]}>
        <LinearGradient
          useAngle
          angle={gradients.logo.angle}
          colors={[...gradients.logo.colors]}
          locations={[...gradients.logo.locations]}
          style={styles.logoTile}>
          <Icon name="boltMd" />
        </LinearGradient>

        <Text style={[type.welcomeTitle, styles.title]}>{welcome.title}</Text>
        <Text style={[type.welcomeTagline, styles.tagline]}>
          {welcome.tagline}
        </Text>

        <View style={styles.grid}>
          {features.map(feature => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              style={styles.tile}
            />
          ))}
        </View>
      </View>

      <View style={[styles.footer, {paddingBottom: insets.bottom + scale(40)}]}>
        <Button
          variant="primary"
          size="lg"
          label={welcome.primaryCta}
          onPress={onLogin}
        />
        <Button
          variant="outline"
          size="lg"
          label={welcome.secondaryCta}
          onPress={onCreateAccount}
        />

        <Text style={type.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink} onPress={onPressTerms}>
            Terms
          </Text>
          {' & '}
          <Text style={styles.termsLink} onPress={onPressPrivacy}>
            Privacy
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl, // 24
  },
  logoTile: {
    width: scale(79.999),
    height: scale(79.999),
    borderRadius: radius.md, // 16
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl, // 20
  },
  title: {
    marginBottom: spacing.md, // 8
  },
  tagline: {
    width: scale(320),
    marginBottom: scale(32),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg, // 12
    width: '100%',
    maxWidth: scale(342.007),
  },
  tile: {
    // Two columns of 165 with a 12 gutter — expressed as flex so the grid
    // reflows on narrower devices.
    flexBasis: '47%',
    flexGrow: 1,
    height: scale(119.86),
  },
  footer: {
    gap: spacing.lg, // 12
    paddingHorizontal: spacing.xxxl, // 24
  },
  termsLink: {
    color: colors.accent,
  },
});
