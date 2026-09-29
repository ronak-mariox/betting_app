import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, Icon} from '../components';
import {kycIntro} from '../data/kyc';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type KycIntroScreenProps = {
  onStart: () => void;
  onLater: () => void;
};

/** KYC intro — Figma node 312:2. Shown after sign-up / login until KYC is submitted. */
export const KycIntroScreen = ({onStart, onLater}: KycIntroScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, {paddingTop: insets.top}]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient
            useAngle
            angle={gradients.kycHero.angle}
            colors={[...gradients.kycHero.colors]}
            locations={[...gradients.kycHero.locations]}
            style={styles.heroTile}>
            <Icon name="kycShield" />
          </LinearGradient>
          <View style={styles.heroBadge}>
            <Icon name="checkBox" size={14.998} />
          </View>
        </View>

        <Text style={[type.kycTitle, styles.title]}>{kycIntro.title}</Text>
        <Text style={[type.welcomeTagline, styles.body]}>{kycIntro.body}</Text>

        <View style={styles.benefits}>
          {kycIntro.benefits.map(benefit => (
            <View key={benefit.title} style={styles.benefit}>
              <Text style={styles.emoji}>{benefit.emoji}</Text>
              <View style={styles.benefitCopy}>
                <Text style={type.featureTitle}>{benefit.title}</Text>
                <Text style={type.featureSub}>{benefit.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {paddingBottom: insets.bottom + spacing.xxxl + spacing.md},
        ]}>
        <Button
          variant="primary"
          size="lg"
          icon="kycShieldSm"
          label={kycIntro.start}
          onPress={onStart}
          style={styles.cta}
        />
        <Button
          variant="subtle"
          label={kycIntro.later}
          onPress={onLater}
          style={styles.later}
        />
        <Text style={type.kycSafeNote}>
          {kycIntro.safeBefore}
          <Text style={styles.safeWord}>{kycIntro.safeWord}</Text>
          {kycIntro.safeAfter}
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
  content: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl, // 40
    paddingHorizontal: spacing.xxxl, // 24
    paddingBottom: spacing.xl, // 16
  },
  hero: {
    width: scale(96),
    height: scale(96),
    marginBottom: spacing.xxl, // 20
  },
  heroTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg, // 24
    borderWidth: scale(1.607),
    borderColor: colors.kycHeroBorder,
  },
  heroBadge: {
    position: 'absolute',
    left: scale(72),
    top: scale(72),
    width: scale(31.997),
    height: scale(31.997),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: scale(1.607),
    borderColor: colors.bgDeep,
  },
  title: {
    paddingBottom: spacing.md, // 8
  },
  body: {
    maxWidth: scale(320),
    paddingBottom: spacing.xxxl, // 24
  },
  benefits: {
    alignSelf: 'stretch',
    gap: spacing.lg, // 12
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    padding: scale(14),
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderCard,
  },
  emoji: {
    fontSize: scale(20),
    lineHeight: scale(28),
    color: colors.textBright,
  },
  benefitCopy: {
    flex: 1,
  },
  footer: {
    gap: spacing.lg, // 12
    paddingHorizontal: spacing.xxxl, // 24
  },
  cta: {
    gap: spacing.md, // 8 — icon ↔ label
  },
  later: {
    height: scale(48),
    borderRadius: radius.md, // 16
  },
  safeWord: {
    color: colors.accent,
  },
});
