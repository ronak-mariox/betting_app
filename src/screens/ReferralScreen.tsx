import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {BackHeader, Card, Icon} from '../components';
import {copyToClipboard, openExternal, shareText} from '../utils/actions';
import {
  howItWorks,
  referralMessage,
  referralHeader,
  referralHero,
  shareTargets,
} from '../data/referral';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type ReferralScreenProps = {
  /** This player's own code, from their account. */
  referralCode?: string;
  onBack?: () => void;
};

/** Each share button hands the same invite to a different app. */
const share = (targetId: string, referralCode: string) => {
  const message = referralMessage(referralCode);
  const text = encodeURIComponent(message);
  switch (targetId) {
    case 'whatsapp':
      return openExternal(
        `whatsapp://send?text=${text}`,
        'WhatsApp is device par nahi mila',
      );
    case 'telegram':
      return openExternal(
        `tg://msg?text=${text}`,
        'Telegram is device par nahi mila',
      );
    case 'copy':
      return copyToClipboard(referralCode, 'Referral code copy ho gaya');
    default:
      return shareText(message);
  }
};

/** Refer & Earn — Figma node 9:92. */
export const ReferralScreen = ({
  referralCode = '',
  onBack,
}: ReferralScreenProps) => (
  <View style={styles.screen}>
    <BackHeader
      title={referralHeader.title}
      subtitle={referralHeader.subtitle}
      onBack={onBack}
    />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.body}>
      {/* Hero */}
      <LinearGradient
        useAngle
        angle={gradients.referralHero.angle}
        colors={[...gradients.referralHero.colors]}
        locations={[...gradients.referralHero.locations]}
        style={styles.hero}>
        <View style={styles.decorCircle} pointerEvents="none" />
        <Text style={type.promoTrophy}>{referralHero.emoji}</Text>
        {referralHero.titleLines.map(line => (
          <Text key={line} style={type.heroTitle}>
            {line}
          </Text>
        ))}
        <Text style={[type.heroSub, styles.heroSub]}>
          {referralHero.subtitle}
        </Text>
      </LinearGradient>

      {/* Code + share */}
      <Card
        borderColor={colors.borderAccentStrong}
        contentStyle={styles.codeCard}>
        <Text style={type.promoSub}>Your Referral Code</Text>
        <View style={styles.codeRow}>
          <Text style={type.referralCodeLg}>{referralCode}</Text>
          <Pressable
            onPress={() =>
              copyToClipboard(referralCode, 'Referral code copy ho gaya')
            }
            accessibilityRole="button"
            accessibilityLabel="Copy referral code"
            style={({pressed}) => [styles.copyBtn, pressed && styles.pressed]}>
            <Icon name="copyRef" />
            <Text style={type.buttonSm}>Copy</Text>
          </Pressable>
        </View>

        <Text style={[type.promoSub, styles.shareVia]}>Share via</Text>
        <View style={styles.shareRow}>
          {shareTargets.map(target => (
            <Pressable
              key={target.id}
              onPress={() => share(target.id, referralCode)}
              accessibilityRole="button"
              accessibilityLabel={target.label}
              style={({pressed}) => [
                styles.shareBtn,
                {backgroundColor: target.color},
                target.id === 'copy' && styles.shareBtnOutline,
                pressed && styles.pressed,
              ]}>
              <Text style={type.shareEmoji}>{target.emoji}</Text>
              <Text style={type.shareLabel}>{target.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* How it works */}
      <Card contentStyle={styles.stepsCard}>
        <Text style={type.cardTitle}>How it works</Text>
        {howItWorks.map(step => (
          <View key={step.step} style={styles.step}>
            <LinearGradient
              useAngle
              angle={gradients.logo.angle}
              colors={[...gradients.logo.colors]}
              locations={[...gradients.logo.locations]}
              style={styles.stepBadge}>
              <Text style={type.stepNumber}>{step.step}</Text>
            </LinearGradient>
            <View style={styles.flex}>
              <Text style={type.settingLabel}>{step.title}</Text>
              <Text style={type.settingSub}>{step.sub}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    gap: spacing.xl, // 16
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(32),
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },

  /* --- Hero ------------------------------------------------------------ */
  hero: {
    alignItems: 'center',
    padding: spacing.xxl, // 20
    borderRadius: radius.lg, // 24
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: scale(128),
    height: scale(128),
    borderRadius: radius.pill,
    top: scale(-64),
    left: scale(293.99),
    backgroundColor: colors.textPrimary,
    opacity: 0.1,
  },
  heroSub: {
    paddingTop: spacing.lg, // 12
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    alignSelf: 'stretch',
    marginTop: spacing.xl, // 16
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md, // 8
    borderRadius: radius.sm, // 14
    backgroundColor: colors.chipGlass,
  },

  /* --- Code + share ---------------------------------------------------- */
  codeCard: {
    padding: scale(16.701),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs, // 4
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 6
    paddingHorizontal: spacing.lg, // 12
    paddingVertical: spacing.md, // 8
    borderRadius: radius.sm, // 14
    backgroundColor: colors.tintAccent,
  },
  shareVia: {
    paddingTop: spacing.xl, // 16
  },
  shareRow: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.md, // 8
  },
  shareBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg, // 12
    borderRadius: radius.sm, // 14
  },
  shareBtnOutline: {
    borderWidth: hairline,
    borderColor: colors.borderOdds,
  },

  /* --- How it works ---------------------------------------------------- */
  stepsCard: {
    padding: scale(16.701),
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingTop: spacing.lg, // 12
  },
  stepBadge: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* --- Referral list ---------------------------------------------------- */
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingTop: spacing.lg, // 12
    paddingBottom: scale(12.701),
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderCard,
  },
  personAvatar: {
    width: scale(39.994),
    height: scale(39.994),
    borderRadius: radius.sm, // 14
    alignItems: 'center',
    justifyContent: 'center',
  },
  personRight: {
    alignItems: 'flex-end',
  },

  /* --- Top referrer ----------------------------------------------------- */
  topCard: {
    alignItems: 'center',
    padding: scale(16.701),
    borderRadius: radius.md, // 16
    borderWidth: hairline,
    borderColor: colors.calloutGoldBorder,
  },
  topLabel: {
    paddingTop: spacing.md, // 8
  },
  topName: {
    paddingTop: spacing.xs, // 4
  },
  topNote: {
    paddingTop: spacing.xs, // 4
    textAlign: 'center',
  },
});
