import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Card, Checkbox, Icon} from '../components';
import {credentials} from '../data/signup';
import {copyToClipboard} from '../utils/actions';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

/** Small copy affordance shared by the username and password rows. */
const CopyButton = ({label, value}: {label: string; value: string}) => (
  <Pressable
    onPress={() => copyToClipboard(value, `${label} copy ho gaya`)}
    accessibilityRole="button"
    accessibilityLabel={`Copy ${label}`}
    style={({pressed}) => [styles.copyBtn, pressed && styles.pressed]}>
    <Icon name="copyXs" />
    <Text style={type.link}>{credentials.copy}</Text>
  </Pressable>
);

type CredentialsScreenProps = {
  username: string;
  password: string;
  onContinue?: () => void;
};

/**
 * Account created — Figma node 62:447.
 * The CTA is drawn at 40% because the "I saved them" box is unticked; here
 * that's the real gate, so the user has to acknowledge before continuing.
 */
export const CredentialsScreen = ({
  username,
  password,
  onContinue,
}: CredentialsScreenProps) => {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.body,
          {paddingTop: insets.top + scale(32)},
        ]}>
        {/* Success badge */}
        <View style={styles.header}>
          <LinearGradient
            useAngle
            angle={gradients.successBadge.angle}
            colors={[...gradients.successBadge.colors]}
            locations={[...gradients.successBadge.locations]}
            style={styles.badge}>
            <Icon name="checkLg" />
          </LinearGradient>

          <Text style={[type.createdTitle, styles.title]}>
            {credentials.title}
          </Text>
          <Text style={type.createdBody}>
            Niche aapki login details hain. Inhe{' '}
            <Text style={type.createdHighlight}>screenshot leke save karo</Text>{' '}
            — yahi se login hoga
          </Text>
        </View>

        {/* Warning */}
        <View style={styles.alert}>
          <Icon name="alert" />
          <Text style={[type.alertBody, styles.flex]}>
            {credentials.warning}
          </Text>
        </View>

        {/* Username */}
        <Card borderColor={colors.borderSheet} contentStyle={styles.credCard}>
          <Text style={type.credentialLabel}>{credentials.usernameLabel}</Text>
          <View style={styles.credRow}>
            <View style={styles.credValue}>
              <Icon name="userSm" />
              <Text style={type.credentialValue} numberOfLines={1}>
                {username}
              </Text>
            </View>
            <CopyButton label="Username" value={username} />
          </View>
        </Card>

        {/* Password */}
        <Card borderColor={colors.borderSheet} contentStyle={styles.credCard}>
          <Text style={type.credentialLabel}>{credentials.passwordLabel}</Text>
          <View style={styles.credRow}>
            <View style={styles.credValue}>
              <Icon name="lockSm" />
              <Text
                style={revealed ? type.credentialValue : type.credentialMasked}
                numberOfLines={1}>
                {revealed ? password : '•'.repeat(password.length)}
              </Text>
            </View>
            <View style={styles.credActions}>
              <Pressable
                onPress={() => setRevealed(current => !current)}
                accessibilityRole="button"
                accessibilityLabel={
                  revealed ? 'Hide password' : 'Show password'
                }
                style={({pressed}) => [
                  styles.eyeBtn,
                  pressed && styles.pressed,
                ]}>
                <Icon name="eyeToggle" />
              </Pressable>
              <CopyButton label="Password" value={password} />
            </View>
          </View>
        </Card>

        {/* Acknowledgement */}
        <Checkbox
          checked={saved}
          onChange={setSaved}
          accessibilityLabel="I have saved my username and password">
          <Text style={type.consent}>
            Haan, maine apna{' '}
            <Text style={styles.strong}>username aur password save</Text> kar
            liya hai
          </Text>
        </Checkbox>

        <Pressable
          onPress={onContinue}
          disabled={!saved}
          accessibilityRole="button"
          accessibilityState={{disabled: !saved}}
          accessibilityLabel={credentials.submit}
          style={({pressed}) => [
            styles.cta,
            !saved && styles.ctaDisabled,
            pressed && saved && styles.pressed,
          ]}>
          <LinearGradient
            useAngle
            angle={gradients.ctaPrimary.angle}
            colors={[...gradients.ctaPrimary.colors]}
            locations={[...gradients.ctaPrimary.locations]}
            style={styles.ctaFill}>
            <Text style={[type.buttonXl, styles.ctaLabel]}>
              {credentials.submit}
            </Text>
            <Icon name="arrowRight" />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    gap: spacing.xl, // 16
    paddingHorizontal: spacing.xxl, // 20
    paddingBottom: scale(32),
  },
  flex: {
    flex: 1,
  },
  strong: {
    color: colors.textPrimary,
  },
  header: {
    alignItems: 'center',
  },
  badge: {
    width: scale(63.999),
    height: scale(63.999),
    borderRadius: radius.md, // 16
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl, // 16
  },
  title: {
    paddingBottom: spacing.xs, // 4
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    padding: scale(12.701),
    borderRadius: radius.md, // 16
    backgroundColor: colors.alertBg,
    borderWidth: hairline,
    borderColor: colors.alertBorder,
  },
  credCard: {
    padding: scale(16.701),
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg, // 12
    paddingTop: spacing.md, // 8
  },
  credValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  credActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md, // 8
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm, // 6
    paddingHorizontal: spacing.lg, // 12
    paddingVertical: spacing.md, // 8
    borderRadius: radius.sm, // 14
    backgroundColor: colors.copyPill,
  },
  eyeBtn: {
    padding: spacing.sm, // 6
    borderRadius: scale(10),
    backgroundColor: colors.eyePill,
  },
  cta: {
    height: scale(55.994),
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
  },
  ctaLabel: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
